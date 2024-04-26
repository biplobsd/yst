<script lang="ts">
  import "src/options/styles.css";
  import { onDestroy, onMount } from "svelte";
  import { delay } from "src/utils/helper";
  import { runtime, type RuntimeMessage } from "src/utils/communication";
  import {
    apiReqDelayWritable,
    firstOAuthKeyWritable,
    secondOAuthKeyWritable,
    firstUserWritable,
    secondUserWritable,
    subscriptionsListWritable,
    primaryChannelWritable,
    apiKeyWritable,
  } from "src/utils/storage";
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
  import SelectAccount from "../api/Select_Account.svelte";
  import {
    SUBSCRIPTIONS_API_URL,
    USERINFO_API_URL,
  } from "src/utils/constants";
  import { SETTINGS_DEFAULT as ud } from "src/utils/default";

  let subscriptionsList = $subscriptionsListWritable;
  let subscriptionCount = $subscriptionsListWritable.length;

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

  function getAccessToken() {
    return $primaryChannelWritable === "0"
      ? $firstOAuthKeyWritable
      : $secondOAuthKeyWritable;
  }

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
      true,
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
            !subscriptionsList.map((y) => y.channelId).includes(elem.channelId),
        );
        if (notFoundList.length === 0) {
          setStatus(
            "All those channels have already been subscribed to! There's no need to subscribe again.",
          );
        }
      } else {
        notFoundList = currentSubs.filter((elem) =>
          subscriptionsList.map((y) => y.channelId).includes(elem.channelId),
        );
        if (notFoundList.length === 0) {
          setStatus(
            "No channel match with your current subscriptions channel list! NO need to unsubscribe",
          );
        }
      }
      subscriptionsListWritable.set(notFoundList);
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
        await delay($apiReqDelayWritable);
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
      subscriptionsListWritable.set(subscriptionsList);
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

  async function parseData({ status, to }: RuntimeMessage) {

    if (to !== "option") {
      return;
    }

    setStatus("msg" in status ? status.msg : status.code);

    switch (status.code) {
      case "accept":
        isReady = true;
        isRunning = false;
        return;
      case "error":
        setStatus(status.msg, true);
        isRunning = false;
        isReady = true;
        primaryChannelWritable.set("-1");
        return;
      case "authToken":
        if ($primaryChannelWritable === "-1") {
          setStatus(
            "Received OAuth token, but it was rejected due to not arriving on time",
            true,
          );
          return;
        }

        setStatus("OAuth token receive. Getting user information");
        switch ($primaryChannelWritable) {
          case "0":
            firstOAuthKeyWritable.set(status.authToken);
            const userData0 = await getUserInfo();
            if (userData0) {
              firstUserWritable.set(userData0);
            }
            break;
          case "1":
            secondOAuthKeyWritable.set(status.authToken);
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
        break;
        default:
          break;
    }
  }

  async function deleteSubscription(id: string) {
    const headers = {
      Authorization: "Bearer " + getAccessToken(),
      "Content-Type": "application/json",
    };

    try {
      const apiKey = $apiKeyWritable;
      if(!apiKey) {
        setStatus("API key is not set", true);
        return false;
      }
      await axios.delete(SUBSCRIPTIONS_API_URL, {
        params: {
          id,
          key: apiKey,
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
              true,
            );
            resetAccount();
            isStop = true;
            return false;
          case 404:
            setStatus(
              "The subscriber identified with the request cannot be found.",
              true,
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
    const headers = {
      Authorization: "Bearer " + getAccessToken(),
      "Content-Type": "application/json",
    };

    try {
      const apiKey = $apiKeyWritable;
      if(!apiKey) {
        setStatus("API key is not set", true);
        return false;
      }

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
            key: apiKey,
          },
          headers,
        },
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
              true,
            );
            resetAccount();
            isStop = true;
            return false;
          case 400:
            setStatus(
              "You have reached your maximum number of subscriptions.",
              true,
            );
            isStop = true;
            return false;
          case 404:
            setStatus(
              "The subscriber identified with the request cannot be found.",
              true,
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
    const headers = {
      Authorization: "Bearer " + getAccessToken(),
      "Content-Type": "application/json",
    };

    let pageToken = undefined;
    subscriptionsList = [];
    const apiKey = $apiKeyWritable;
    if (!apiKey) {
      setStatus("API key is not set", true);
      return;
    }

    while (true) {
      let res: any;
      try {
        res = await axios.get(SUBSCRIPTIONS_API_URL, {
          params: {
            pageToken,
            part: "snippet",
            mine: true,
            key: apiKey,
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
                true,
              );
              resetAccount();
              return;
            case 404:
              setStatus(
                "The subscriber identified with the request cannot be found.",
                true,
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

      await delay($apiReqDelayWritable);
    }

    log.info(subscriptionsList);
    subscriptionsListWritable.set(subscriptionsList);
    subscriptionCount = subscriptionsList.length;
    setStatus("Subscription list collected successful");
  }

  function resetAccount() {
    switch ($primaryChannelWritable) {
      case "0":
        firstOAuthKeyWritable.set("");
        firstUserWritable.set(ud.firstUser);
        break;
      case "1":
        secondOAuthKeyWritable.set("");
        secondUserWritable.set(ud.secondUser);
        break;
    }
  }

  async function getUserInfo(): Promise<User | null> {
    try {
      const res = await axios.get(USERINFO_API_URL, {
        params: {
          access_token: getAccessToken(),
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
    storageRemoveListener = runtime.addListener(parseData);
    await runtime.send({
      to: "background",
      status: { code: "ready", msg: "Get ready status" },
    });
  });

  onDestroy(() => {
    storageRemoveListener();
  });
</script>

<div class="space-y-2">
  <SelectAccount bind:isStop bind:isReady bind:isRunning {setStatus} />
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
      disabled={$primaryChannelWritable === "-1" ||
        !isReady ||
        isSubRunning ||
        isRunning}
      class="collect-channel-btn"
      on:click={collectSubs}>Collect channel</button
    >
    <button
      disabled={$primaryChannelWritable === "-1" ||
        (subscriptionCount ? false : true) ||
        isSubRunning ||
        !isReady ||
        isRunning}
      class="subscribe-btn"
      on:click={() => subUnSub(true)}>Subscribe</button
    >
    <button
      disabled={$primaryChannelWritable === "-1" ||
        (subscriptionCount ? false : true) ||
        isSubRunning ||
        !isReady ||
        isRunning}
      class="unsubscribe-btn"
      on:click={() => subUnSub(false)}>Unsubscribe</button
    >
  </div>
</div>
