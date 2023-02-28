import { fetchEnsAddress } from "@wagmi/core";
import React, { useEffect, useRef, useState } from "react";
import { ProfileByHandle } from "../graphql";
import {
  classNames,
  isCCAddress,
  isEnsAddress,
  isValidLongWalletAddress,
  RecipientInputMode,
} from "../helpers";
import { address } from "./Address";
import { useLazyQuery } from "@apollo/client";
type AddressInputProps = {
  id?: string;
  name?: string;
  className?: string;
  placeholder?: string;
  submitValue?: (address: address) => void;
  setRecipientInputMode?: (value: number) => void;
};

const AddressInput = ({
  id,
  className,
  placeholder,
  submitValue,
  setRecipientInputMode,
}: AddressInputProps): JSX.Element => {
  const [recipientEnteredValue, setRecipientEnteredValue] =
    useState<string>("");

  const inputElement = useRef(null);

  const focusInputElementRef = () => {
    (inputElement.current as any)?.focus();
  };

  useEffect(() => {
    focusInputElementRef();
  }, []);

  const [fetchProfile, { data }] = useLazyQuery(ProfileByHandle);

  useEffect(() => {
    const handleSubmit = async () => {
      if (recipientEnteredValue) {
        if (isEnsAddress(recipientEnteredValue)) {
          setRecipientInputMode &&
            setRecipientInputMode(RecipientInputMode.FindingEntry);
          const address = await fetchEnsAddress({
            name: recipientEnteredValue,
          });
          if (address) {
            submitValue && submitValue(address);
          } else {
            setRecipientInputMode &&
              setRecipientInputMode(RecipientInputMode.InvalidEntry);
          }
          // Check if the recipient is a ccProfile handle
        } else if (isCCAddress(recipientEnteredValue)) {
          setRecipientInputMode &&
            setRecipientInputMode(RecipientInputMode.FindingEntry);
          // Remove the .cc from the handle
          const handle = recipientEnteredValue.replace(".cc", "");
          // Fetch the profile data
          const otherUserProfileData = await fetchProfile({
            variables: {
              handle: handle,
              me: "0x0000000000000000000000000000000000000000",
            },
          });
          // Get the address from the profile data
          const address =
            otherUserProfileData?.data?.profileByHandle?.owner?.address;
          if (address) {
            //  If the address is valid, submit the value
            submitValue && submitValue(address);
          } else {
            setRecipientInputMode &&
              setRecipientInputMode(RecipientInputMode.InvalidEntry);
          }
        } else if (isValidLongWalletAddress(recipientEnteredValue)) {
          submitValue && submitValue(recipientEnteredValue as address);
        } else {
          setRecipientInputMode &&
            setRecipientInputMode(RecipientInputMode.InvalidEntry);
        }
      }
    };
    handleSubmit();
  }, [recipientEnteredValue]);

  return (
    <input
      id={id}
      name="recipient"
      className={classNames(className || "")}
      placeholder={placeholder}
      onChange={(e) =>
        setRecipientEnteredValue((e.target as HTMLInputElement).value)
      }
      value={recipientEnteredValue}
      ref={inputElement}
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
      spellCheck="false"
      data-testid="message-to-input"
    />
  );
};

export default AddressInput;
