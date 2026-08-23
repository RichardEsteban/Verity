import { BaseError, ContractFunctionRevertedError } from "viem";

const MAX_SUBSCRIPTIONS_MESSAGE =
  "Maximum of 50 subscriptions reached. Unsubscribe from a creator first.";

export function parseTransactionError(err: unknown): string {
  if (err instanceof BaseError) {
    const rejected = err.walk((e: unknown) => {
      if (!(e instanceof Error)) return false;
      return (
        e.name === "UserRejectedRequestError" ||
        e.message.includes("User rejected")
      );
    });
    if (rejected) {
      return "Transaction was rejected by the wallet.";
    }

    const reverted = err.walk(
      (e) => e instanceof ContractFunctionRevertedError
    ) as ContractFunctionRevertedError | undefined;

    if (reverted?.data?.errorName === "MaxSubscriptionsReached") {
      return MAX_SUBSCRIPTIONS_MESSAGE;
    }

    const short = err.shortMessage || err.message;
    return short.length > 200 ? `${short.slice(0, 200)}...` : short;
  }

  if (err instanceof Error && err.message.includes("User rejected")) {
    return "Transaction was rejected by the wallet.";
  }

  const message = err instanceof Error ? err.message : String(err);
  if (message.includes("MaxSubscriptionsReached")) {
    return MAX_SUBSCRIPTIONS_MESSAGE;
  }
  return message.length > 200 ? `${message.slice(0, 200)}...` : message;
}
