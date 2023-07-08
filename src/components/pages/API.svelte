<script lang="ts">
  import "src/options/styles.css";
  import { onDestroy, onMount } from "svelte";
  import { delay } from "src/utils/helper";
  import {
    runtime,
    runtimeMessageSchema,
    type RuntimeMessage,
  } from "src/utils/communication";
  import {
    apiReqDelayWritable,
    channel0OAuthTokenWritable,
    channel1OAuthTokenWritable,
    firstUserWritable,
    primaryChannelWritable,
    secondUserWritable,
    subscriptionsWritable,
  } from "src/utils/storage";
  import { get } from "svelte/store";
  import { blur, slide } from "svelte/transition";
  import log from "src/utils/logger";
  import Timer from "../Timer.svelte";
  import axios, { AxiosError } from "axios";
  import {
    UserSchema,
    type User,
    SubscriptionsRawSchema,
    type SubscriptionsList,
  } from "src/utils/schema";
  import Data from "../api/Data.svelte";
  import { readySignalSend } from "src/background/helper";
  import SelectAccount from "../api/Select_Account.svelte";
  import {
    API_KEY,
    SUBSCRIPTIONS_API_URL,
    USERINFO_API_URL,
  } from "src/utils/constants";
  import type { PrimaryChannel } from "src/utils/types";
  import { API_REQ_DELAY_DEFAULT } from "src/utils/default.js";

  let subscriptionsList: SubscriptionsList = [];
  let subscriptionCount: number = 0;
  let channel0OAuthToken: string | null = null;
  let channel1OAuthToken: string | null = null;

  let primaryChannel: PrimaryChannel = -1;
  let lastStatusData: RuntimeMessage | undefined = undefined;

  let isRunning = true;
  let isReady = false;
  let status: { isError: boolean; msg?: string } = { isError: false };
  let storageRemoveListener: () => void;
  let isStop = false;
  let isSubRunning = false;
  let failedCount = 0;
  let successCount = 0;
  let actionName = "";
  let apiReqDelay = API_REQ_DELAY_DEFAULT;

  async function stop() {
    isStop = true;
  }

  async function collectSubs() {
    if (isRunning) {
      return false;
    }
    reset();
    isRunning = true;
    actionName = "Collect Channel";

    await getChannelsList();
    isRunning = false;
  }

  async function collectAndWait() {
    await collectSubs();

    for (let index = 0; index < 30; index++) {
      await delay(500);
      if (!isRunning) {
        return true;
      }
    }
    setStatus(
      "Unable to get the subscriptions list from the content client",
      true
    );
    return false;
  }

  async function filterUnSubs(mode = true) {
    const currentSubs = subscriptionsList;
    if (!(await collectAndWait())) {
      return;
    }
    if (subscriptionsList !== currentSubs) {
      let notFoundList: SubscriptionsList;
      if (mode) {
        notFoundList = currentSubs.filter(
          (elem) =>
            !subscriptionsList.map((y) => y.channelId).includes(elem.channelId)
        );
        if (notFoundList.length === 0) {
          setStatus(
            "All those channels have already been subscribed to! There's no need to subscribe again."
          );
        }
      } else {
        notFoundList = currentSubs.filter((elem) =>
          subscriptionsList.map((y) => y.channelId).includes(elem.channelId)
        );
        if (notFoundList.length === 0) {
          setStatus(
            "No channel match with your current subscriptions channel list! NO need to unsubscribe"
          );
        }
      }
      subscriptionsWritable.set(notFoundList);
      subscriptionsList = notFoundList;
      subscriptionCount = notFoundList.length;
    }
    return;
  }

  async function subUnSub(mode = true) {
    const un = mode ? "" : "un";
    if (isRunning) {
      return;
    }
    reset();
    try {
      setStatus("Getting current channels");
      await filterUnSubs(mode);
      actionName = `${mode ? "" : "un"}subscribe`;
      if (subscriptionsList.length === 0) {
        return;
      }
      isRunning = true;
      isSubRunning = true;
      setStatus(`Starting to ${un}subscribe to the channels`);

      const len = subscriptionsList.length;
      const copyList = Object.assign([], subscriptionsList);

      for (let index = 0; index < len; index++) {
        if (isStop) {
          break;
        }
        const { channelId, id, title } = copyList[index];
        const response = mode
          ? await insertSubscription(channelId)
          : await deleteSubscription(id);

        if (response) {
          setStatus(`${un}subscribe to the ${title} successful`);
          successCount++;
          subscriptionsList.shift();
          subscriptionCount--;
        } else {
          setStatus(`${un}subscribe to the ${title} unsuccessful`, true);
          failedCount++;
        }
        await delay(apiReqDelay);
      }
      if (!isStop) {
        setStatus("Done");
      }
    } catch (error) {
      setStatus("Error: " + error, true);
      return;
    } finally {
      isSubRunning = false;
      isRunning = false;
      // console.log(subscriptionsList);
      subscriptionsWritable.set(subscriptionsList);
      isStop = false;
    }
  }

  function setStatus(msg: string, isError = false) {
    status = { isError, msg };
  }

  function reset() {
    isRunning = false;
    isStop = false;
    isSubRunning = false;
    failedCount = 0;
    successCount = 0;
  }

  async function parseData(dataLocal: RuntimeMessage) {
    setStatus("...");

    const validationResult = await runtimeMessageSchema.safeParseAsync(
      dataLocal
    );

    if (!validationResult.success) {
      setStatus("Error when parsing data", true);
      lastStatusData = undefined;
      return;
    }

    lastStatusData = validationResult.data;

    log.info(lastStatusData);

    if (
      lastStatusData.type === "status" ||
      lastStatusData.type === "statusOption"
    ) {
      const status = lastStatusData.status;
      setStatus(status.msg);
      switch (status.code) {
        case "accept":
          isReady = true;
          isRunning = false;
          return;
        case "error":
          setStatus(status.msg, true);
          isRunning = false;
          isReady = true;
          return;
        default:
          return;
      }
    } else if (dataLocal.type === "dataOptionAuthToken") {
      if (primaryChannel === -1) {
        setStatus(
          "Received OAuth token, but it was rejected due to not arriving on time",
          true
        );
        return;
      }

      setStatus("OAuth token receive. Getting user information");
      switch (primaryChannel) {
        case 0:
          channel0OAuthTokenWritable.set(dataLocal.authToken);
          const userData0 = await getUserInfo();
          if (userData0) {
            firstUserWritable.set(userData0);
          }
          break;
        case 1:
          channel1OAuthTokenWritable.set(dataLocal.authToken);
          const userData1 = await getUserInfo();
          if (userData1) {
            secondUserWritable.set(userData1);
          }
        default:
          break;
      }

      isRunning = false;
      isReady = true;

      setStatus("OAuth token receive successful");
    }
  }

  async function deleteSubscription(id: string) {
    const oAuthToken =
      primaryChannel === 0 ? channel0OAuthToken : channel1OAuthToken;
    const headers = {
      Authorization: "Bearer " + oAuthToken,
      "Content-Type": "application/json",
    };

    try {
      await axios.delete(SUBSCRIPTIONS_API_URL, {
        params: {
          id,
          key: import.meta.env.VITE_API_KEY,
        },
        headers,
      });
      return true;
    } catch (err) {
      const errors = err as Error | AxiosError;
      if (axios.isAxiosError(errors)) {
        log.error(errors);
        switch (errors.response?.status) {
          case 403:
          case 401:
            setStatus(
              "Reconnect your account. OAuth token might be expired!",
              true
            );
            resetAccount();
            isStop = true;
            return false;
          case 404:
            setStatus(
              "The subscriber identified with the request cannot be found.",
              true
            );

            return false;
        }

        setStatus(errors.response?.data.error.message, true);
      } else {
        setStatus(errors.message, true);
      }
      return false;
    }
  }

  async function insertSubscription(channelId: string) {
    const oAuthToken =
      primaryChannel === 0 ? channel0OAuthToken : channel1OAuthToken;
    const headers = {
      Authorization: "Bearer " + oAuthToken,
      "Content-Type": "application/json",
    };

    try {
      await axios.post(
        SUBSCRIPTIONS_API_URL,
        {
          snippet: {
            resourceId: {
              kind: "youtube#channel",
              channelId,
            },
          },
        },
        {
          params: {
            part: "snippet",
            key: API_KEY,
          },
          headers,
        }
      );
      return true;
    } catch (err) {
      const errors = err as Error | AxiosError;
      if (axios.isAxiosError(errors)) {
        log.error(errors);
        switch (errors.response?.status) {
          case 403:
          case 401:
            setStatus(
              "Reconnect your account. OAuth token might be expired!",
              true
            );
            resetAccount();
            isStop = true;
            return false;
          case 400:
            setStatus(
              "You have reached your maximum number of subscriptions.",
              true
            );
            isStop = true;
            return false;
          case 404:
            setStatus(
              "The subscriber identified with the request cannot be found.",
              true
            );

            return false;
        }

        setStatus(errors.response?.data.error.message, true);
      } else {
        setStatus(errors.message, true);
      }
      return false;
    }
  }

  async function getChannelsList() {
    const oAuthToken =
      primaryChannel === 0 ? channel0OAuthToken : channel1OAuthToken;
    const headers = {
      Authorization: "Bearer " + oAuthToken,
      "Content-Type": "application/json",
    };

    let pageToken = undefined;
    subscriptionsList = [];
    while (true) {
      let res: any;
      try {
        res = await axios.get(SUBSCRIPTIONS_API_URL, {
          params: {
            pageToken,
            part: "snippet",
            mine: true,
            key: API_KEY,
            fields:
              "nextPageToken, items(id, snippet(title, resourceId(channelId)))",
            maxResults: 50,
          },
          headers,
        });
      } catch (err) {
        const errors = err as Error | AxiosError;
        if (axios.isAxiosError(errors)) {
          log.error(errors);
          switch (errors.response?.status) {
            case 401:
              setStatus(
                "Reconnect your account. OAuth token might be expired!",
                true
              );
              resetAccount();
              return;
            case 404:
              setStatus(
                "The subscriber identified with the request cannot be found.",
                true
              );
              return;
          }

          setStatus(errors.response?.data.error.message, true);
        } else {
          setStatus(errors.message, true);
        }
        // do what you want with your axios error

        return;
      }
      const raw = await SubscriptionsRawSchema.safeParseAsync(res.data);
      log.info(raw);
      if (!raw.success) {
        break;
      }
      const data = raw.data;

      for (let { id, snippet } of data.items) {
        subscriptionsList.push({
          id: id,
          channelId: snippet.resourceId.channelId,
          title: snippet.title,
        });
      }

      if (!raw.data.nextPageToken) {
        break;
      }

      pageToken = data.nextPageToken;

      await delay(apiReqDelay);
    }

    log.info(subscriptionsList);
    subscriptionsWritable.set(subscriptionsList);
    subscriptionCount = subscriptionsList.length;
    setStatus("Subscription list collected successful");
  }

  function resetAccount() {
    switch (primaryChannel) {
      case 0:
        channel0OAuthTokenWritable.set(null);
        firstUserWritable.set(null);
        break;
      case 1:
        channel1OAuthTokenWritable.set(null);
        secondUserWritable.set(null);
        break;
    }
  }

  async function getUserInfo(): Promise<User | null> {
    try {
      const res = await axios.get(USERINFO_API_URL, {
        params: {
          access_token:
            primaryChannel === 0 ? channel0OAuthToken : channel1OAuthToken,
        },
      });

      const userData = await UserSchema.safeParseAsync(res.data);
      if (userData.success) {
        return userData.data;
      } else {
        return null;
      }
    } catch (error) {
      log.error(error);
      return null;
    }
  }

  onMount(async () => {
    channel0OAuthTokenWritable.subscribe(
      (value) => (channel0OAuthToken = value)
    );

    channel1OAuthTokenWritable.subscribe(
      (value) => (channel1OAuthToken = value)
    );

    primaryChannelWritable.subscribe((value) => (primaryChannel = value));

    apiReqDelayWritable.subscribe((value) => (apiReqDelay = value));

    subscriptionsList = get(subscriptionsWritable);
    subscriptionCount = subscriptionsList.length;

    storageRemoveListener = runtime.addListener(parseData);
    await readySignalSend();
  });

  onDestroy(() => {
    storageRemoveListener();
  });
</script>

<div class="space-y-2">
  <SelectAccount
    bind:isStop
    bind:isReady
    bind:isRunning
    bind:primaryChannel
    {setStatus}
  />
  <Data bind:subscriptionCount />
  <div>
    <div
      transition:slide
      class="font-bold flex items-center justify-between w-full h-6 mb-[2px]"
    >
      <div class="flex items-start gap-1 h-full">
        Status
        {#if isRunning || !isReady || isSubRunning}
          <div
            transition:blur
            class="tooltip tooltip-info"
            data-tip={isStop ? "Please wait..." : "Click to Stop now"}
          >
            <button
              disabled={isStop}
              class="btn btn-xs flex normal-case"
              on:click={stop}
            >
              <span class="loading loading-infinity" />
              <span class="animate-pulse">
                {#if isStop}
                  <div transition:slide>Stopping...</div>
                {:else}
                  <div transition:slide>Stop</div>
                {/if}
              </span>
            </button>
          </div>
        {/if}
      </div>
      {#if failedCount !== 0 || successCount !== 0}
        <div
          transition:slide
          class="text-base-content/70 font-normal flex gap-1"
        >
          <div class="flex gap-1 h-full">
            Failed :
            {#key failedCount}
              <div in:blur class="text-error/80">{failedCount}</div>
            {/key}
          </div>
          <div class="flex gap-1 h-full">
            Success :
            {#key successCount}
              <div in:blur class="text-success/80">
                {successCount}
              </div>
            {/key}
          </div>
        </div>
      {/if}
    </div>
    <div
      class="border-blue-500/50 border-2 w-full py-2 px-2 rounded-md text-xs tracking-wider"
    >
      {#if status.msg}
        <div class={status.isError ? "text-red-500" : undefined}>
          {status.msg}
        </div>
      {:else if !isReady && !isSubRunning}
        <div transition:slide class="animate-bounce">
          Waiting for the background scripts ready signal ...
        </div>
      {/if}
    </div>
  </div>
  <div class="w-[17rem] space-y-2">
    <div class="capitalize flex justify-between">
      <div class="font-bold">Actions</div>
      {#if actionName !== ""}
        <div
          transition:blur
          class="font-normal text-base-content/70 flex gap-1"
        >
          {#if !(isRunning || !isReady || isSubRunning)}
            <span transition:blur>Last run:</span>
          {/if}
          <Timer bind:isRunning={isSubRunning} />
          <div>{actionName}</div>
        </div>
      {/if}
    </div>
    <button
      disabled={primaryChannel === -1 || !isReady || isSubRunning || isRunning}
      class="collect-channel-btn"
      on:click={collectSubs}>Collect channel</button
    >
    <button
      disabled={primaryChannel === -1 ||
        (subscriptionCount ? false : true) ||
        isSubRunning ||
        !isReady ||
        isRunning}
      class="subscribe-btn"
      on:click={() => subUnSub(true)}>Subscribe</button
    >
    <button
      disabled={primaryChannel === -1 ||
        (subscriptionCount ? false : true) ||
        isSubRunning ||
        !isReady ||
        isRunning}
      class="unsubscribe-btn"
      on:click={() => subUnSub(false)}>Unsubscribe</button
    >
  </div>
</div>
