<script lang="ts">
  import { PassthroughBlobProvider, ZipReader } from "async-zip-reader";
  import { csv_async_iter } from "csv-iter-parse";

  export let channelsIdsTakeoutSave: (channelIDs: string[]) => void;
  let files: FileList;
  let isLoading = false;
  const subCsvPath =
    "Takeout/YouTube and YouTube Music/subscriptions/subscriptions.csv";

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
        if (id) channelIds.push("channel/" + id);
      }
      channelsIdsTakeoutSave(channelIds);
    }
  }

  const fileCheck = async () => {
    if (files && !isLoading) {
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
    console.log(files);

    fileCheck();
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
