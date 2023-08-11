<script lang="ts">
  import { PassthroughBlobProvider, ZipReader } from "async-zip-reader";
  import axios, { AxiosError } from "axios";
  import { csv_async_iter } from "csv-iter-parse";
  import { API_KEY, CHANNEL_API_URL } from "src/utils/constants";
  import { API_REQ_DELAY_DEFAULT } from "src/utils/default";
  import { delay } from "src/utils/helper";
  import log from "src/utils/logger";
  import { ChannelRawSchema } from "src/utils/schema";
  import qs from "qs";

  export let channelsIdsTakeoutSave: (channelIDs: string[]) => void;
  let files: FileList;
  let isLoading = false;
  const subCsvPath =
    "Takeout/YouTube and YouTube Music/subscriptions/subscriptions.csv";

  async function convertChannelIdToCustomURL(channelIds: string[]) {
    const customUrls: string[] = [];
    for (let index = 0; index < channelIds.length; index += 50) {
      let res: any;
      try {
        res = await axios.get(CHANNEL_API_URL, {
          params: {
            id: channelIds.slice(index, index + 50),
            part: "snippet",
            fields: "items(snippet(customUrl))",
            maxResults: 50,
            key: API_KEY,
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
                "Reconnect your account. OAuth token might be expired!"
              );
              return customUrls;
            case 404:
              console.error(
                "The subscriber identified with the request cannot be found."
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
      await delay(API_REQ_DELAY_DEFAULT);
    }
    return customUrls;
  }

  async function handleFileSelect(file: File) {
    const zip = await ZipReader.init(new PassthroughBlobProvider(file));
    const zipEntry = zip.files.find((x) => x.path === subCsvPath);
    if (zipEntry) {
      const subscriptCSVFile = await zip.extract(zipEntry);
      const channelIds: string[] = [];

      let isFirstRow = true;
      for await (let row of csv_async_iter(subscriptCSVFile.stream())) {
        if (isFirstRow) {
          isFirstRow = false;
          continue;
        }
        const id = row[0];
        if (id) channelIds.push(id);
      }
      const customUrls = await convertChannelIdToCustomURL(channelIds);
      channelsIdsTakeoutSave(customUrls);
    }
  }

  const fileCheck = async () => {
    if (!isLoading) {
      const file = files.item(0);
      if (file) {
        try {
          isLoading = true;
          await handleFileSelect(file);
        } catch (error) {
          console.log(error);
        } finally {
          isLoading = false;
        }
      }
    }
  };

  $: {
    if (files) fileCheck();
  }
</script>

<div class="space-y-2 m-1 p-1 form-control">
  <div class="font-bold text-sm">Takeout import</div>
  <div class="relative w-full h-full">
    {#if isLoading}
      <div
        class="absolute w-full flex justify-center items-center backdrop-blur-sm h-full rounded"
      >
        <div class="loading" />
      </div>
    {/if}
    <input
      bind:files
      name="Takeout"
      class="file-input w-full file-input-sm"
      type="file"
    />
  </div>
</div>
