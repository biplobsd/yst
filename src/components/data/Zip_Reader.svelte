<script lang="ts">

  import { PassthroughBlobProvider, ZipReader } from "async-zip-reader";
  import axios, { AxiosError } from "axios";
  import { csv_async_iter } from "csv-iter-parse";
  import { CHANNEL_API_URL } from "src/utils/constants";
  import { SETTINGS_DEFAULT as sd } from "src/utils/default";
  import { delay } from "src/utils/helper";
  import log from "src/utils/logger";
  import { ChannelRawSchema } from "src/utils/schema";
  import qs from "qs";
  import { toast } from "svelte-sonner";
  import DocsLink from "../Docs_Link.svelte";
  import { docs } from "src/utils/docs";
  import { apiKeyWritable } from "src/utils/storage";

  interface Props {
    channelsIdsTakeoutSave: (channelIDs: string[]) => void;
  }

  let { channelsIdsTakeoutSave }: Props = $props();
  let isLoading = $state(false);
  const subCsvPath =
    "Takeout/YouTube and YouTube Music/subscriptions/subscriptions.csv";

  async function convertChannelIdToCustomURL(channelIds: string[]) {
    const customUrls: string[] = [];
    for (let index = 0; index < channelIds.length; index += 50) {
      let res: any;
      try {
        const apiKey = $apiKeyWritable;
        if (!apiKey) {
          toast.error("API key is not set");
          return customUrls;
        }

        res = await axios.get(CHANNEL_API_URL, {
          params: {
            id: channelIds.slice(index, index + 50),
            part: "snippet",
            fields: "items(snippet(customUrl))",
            maxResults: 50,
            key: apiKey,
          },
          paramsSerializer: (params) => {
            return qs.stringify(params, { arrayFormat: "repeat" });
          },
        });
      } catch (err) {
        const errors = err as Error | AxiosError;
        if (axios.isAxiosError(errors)) {
          log.error(errors);
          switch (errors.response?.status) {
            case 401:
              console.error(
                "Reconnect your account. OAuth token might be expired!",
              );
              return customUrls;
            case 404:
              console.error(
                "The subscriber identified with the request cannot be found.",
              );
              return customUrls;
          }
          console.error(errors.response?.data.error.message);
        } else {
          console.error(errors.message);
        }
        return customUrls;
      }
      const raw = await ChannelRawSchema.safeParseAsync(res.data);
      if (!raw.success) {
        break;
      }
      customUrls.push(...raw.data);
      await delay(sd.apiReqDelay);
    }
    return customUrls;
  }

  async function handleFileSelect(file: File) {
    const toastID = toast.loading("Importing zip file...");
    const zip = await ZipReader.init(new PassthroughBlobProvider(file));
    toast.loading("Finding subscriptions.csv file...", { id: toastID });
    const zipEntry = zip.files.find((x) => x.path === subCsvPath);
    if (zipEntry) {
      toast.loading("Extracting subscriptions.csv", { id: toastID });
      const subscriptCSVFile = await zip.extract(zipEntry);
      const channelIds: string[] = [];

      toast.loading("Parsing csv", { id: toastID });
      let isFirstRow = true;
      for await (let row of csv_async_iter(subscriptCSVFile.stream())) {
        if (isFirstRow) {
          isFirstRow = false;
          continue;
        }
        const id = row[0];
        if (id) channelIds.push(id);
      }

      toast.loading("Converting channel ID to custom URL", { id: toastID });
      const customUrls = await convertChannelIdToCustomURL(channelIds);
      if(customUrls.length === 0) {
        toast.error("No custom URL found", { id: toastID });
        return;
      }
      toast.loading("Saving custom URL", { id: toastID });
      channelsIdsTakeoutSave(customUrls);
      toast.success("All done", { id: toastID });
    } else {
      toast.error("subscriptions.csv file not found in the zip", {
        id: toastID,
      });
    }
  }

  const fileCheck = async (file: File | null) => {
    if (file && !isLoading) {
      if (file) {
        try {
          isLoading = true;
          await handleFileSelect(file);
        } catch (error) {
          console.log(error);
          toast.error(error as string);
        } finally {
          isLoading = false;
        }
      }
    }
  };

  function handleFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    let files = input.files ? Array.from(input.files) : [];
    fileCheck(files[0]);
  }
</script>

<div class="space-y-2 my-2 form-control">
  <div class="font-bold flex items-center gap-1 text-sm">
    Takeout import <DocsLink href={docs.googleTakeout} />
  </div>
  <div class="relative w-full h-full">
    {#if isLoading}
      <div
        class="absolute w-full flex justify-center items-center backdrop-blur-sm h-full rounded"
      >
        <div class="loading"></div>
      </div>
    {/if}
    <div class="flex items-center justify-center w-full">
      <label
        for="dropzone-file"
        class="flex flex-col h-12 items-center justify-center w-full border-2 border-base-300 border-dashed rounded-lg cursor-pointer bg-base-content/30 hover:bg-base-content/40"
      >
        <p class="text-sm">
          <span class="font-semibold">Click to choose zip file</span>
        </p>
        <input
          id="dropzone-file"
          name="Takeout"
          type="file"
          class="hidden"
          accept=".zip"
          onchange={handleFileChange}
        />
      </label>
    </div>
  </div>
</div>
