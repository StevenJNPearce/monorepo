import { AppInstanceInfo, Node } from "@counterfactual/types";

import { InstructionExecutor } from "../../../machine";
import { StateChannel } from "../../../models";
import { Store } from "../../../store";
import {
  NO_APP_INSTANCE_ID_TO_INSTALL,
  VIRTUAL_APP_INSTALLATION_FAIL
} from "../../errors";

export async function installVirtual(
  store: Store,
  instructionExecutor: InstructionExecutor,
  params: Node.InstallParams
): Promise<AppInstanceInfo> {
  const { appInstanceId } = params;

  if (!appInstanceId || !appInstanceId.trim()) {
    return Promise.reject(NO_APP_INSTANCE_ID_TO_INSTALL);
  }

  const appInstanceInfo = await store.getProposedAppInstanceInfo(appInstanceId);

  let updatedStateChannelsMap: Map<string, StateChannel>;
  try {
    updatedStateChannelsMap = await instructionExecutor.runInstallVirtualAppProtocol(
      new Map(Object.entries(await store.getAllChannels())),
      {
        initiatingXpub: appInstanceInfo.proposedToIdentifier,
        respondingXpub: appInstanceInfo.proposedByIdentifier,
        intermediaryXpub: appInstanceInfo.intermediaries![0],
        defaultTimeout: appInstanceInfo.timeout.toNumber(),
        appInterface: {
          addr: appInstanceInfo.appId,
          ...appInstanceInfo.abiEncodings
        },
        initialState: appInstanceInfo.initialState,
        initiatingBalanceDecrement: appInstanceInfo.myDeposit,
        respondingBalanceDecrement: appInstanceInfo.peerDeposit
      }
    );
  } catch (e) {
    return Promise.reject(`${VIRTUAL_APP_INSTALLATION_FAIL}: ${e}`);
  }

  updatedStateChannelsMap.forEach(
    async stateChannel => await store.saveStateChannel(stateChannel)
  );

  await store.saveRealizedProposedAppInstance(appInstanceInfo);

  return appInstanceInfo;
}
