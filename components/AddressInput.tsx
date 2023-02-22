import { fetchEnsAddress } from "@wagmi/core";
import React, { useEffect, useRef, useState } from "react";
import { ProfileByHandle } from "../graphql/ProfileByHandle";
import { client as apolloClient } from '../graphql/api'
import {
  classNames,
  isCCAddress,
  isEnsAddress,
  isValidLongWalletAddress,
  RecipientInputMode,
} from "../helpers";
import { address } from "./Address";

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
        } else if (isCCAddress(recipientEnteredValue)) {
          setRecipientInputMode &&
            setRecipientInputMode(RecipientInputMode.FindingEntry);
          const handle = recipientEnteredValue.replace(".cc", "");
          const otherUserProfileData = await apolloClient.query({
            query: ProfileByHandle,
            variables: {
              handle
            }
          });
          console.log(otherUserProfileData?.data);
          const address = otherUserProfileData?.data?.profileByHandle?.owner?.address;
          console.log(address);
          if (address) {
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
