<script lang="ts">

  import { PassthroughBlobProvider, ZipReader } from "async-zip-reader";
  import { csv_async_iter } from "csv-iter-parse";
  import { type SubscriptionsList } from "src/utils/schema";
  import { toast } from "svelte-sonner";
  import DocsLink from "../Docs_Link.svelte";
  import { docs } from "src/utils/docs";
  import { subscriptionsListWritable } from "src/utils/storage";

  interface Props {
    subscriptionCount: number;
  }

  let { subscriptionCount = $bindable() }: Props = $props();

  let isLoading = $state(false);
  const subCsvPath =
    "Takeout/YouTube and YouTube Music/subscriptions/subscriptions.csv";

  async function handleFileSelect(file: File) {
    const toastID = toast.loading("Importing zip file...");
    const zip = await ZipReader.init(new PassthroughBlobProvider(file));
    toast.loading("Finding subscriptions.csv file...", { id: toastID });
    const zipEntry = zip.files.find((x) => x.path === subCsvPath);
    if (zipEntry) {
      toast.loading("Extracting subscriptions.csv", { id: toastID });
      const subscriptCSVFile = await zip.extract(zipEntry);
      const channelIds:SubscriptionsList = [];

      toast.loading("Parsing csv", { id: toastID });
      let isFirstRow = true;
      for await (let row of csv_async_iter(subscriptCSVFile.stream())) {
        if (isFirstRow) {
          isFirstRow = false;
          continue;
        }
        const id = row[0];
        const title = row[2];
        if (id && title) channelIds.push({
          channelId: id,
          title: title,
        });
      }


      if(channelIds.length === 0) {
        toast.error("No valid entry found", { id: toastID });
        return;
      }
      toast.loading("Saving...", { id: toastID });
      subscriptionsListWritable.set(channelIds);
      subscriptionCount = channelIds.length;
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
