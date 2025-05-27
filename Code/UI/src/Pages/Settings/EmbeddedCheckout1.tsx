import React, { useCallback, useEffect, useRef } from "react";
import { loadStripe, StripeEmbeddedCheckout } from "@stripe/stripe-js";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout
} from '@stripe/react-stripe-js';
import { RootState } from "@/src/State/store";
import { useSelector } from "react-redux";

const stripePromise = loadStripe("pk_test_51OMOd1IPNba2ZRhNa408MOi6lI8puT8ekOIsI0Q5sBos5DmcM8LOEbWI2GYaOxtBEtH8E53wlzxxsb8jyKtHnH6o00F7QyrsQ8");

type EmbeddedCheckoutProps = {
  priceId: string;
  quantity: number;
  productName:string;
  packagetype:string;
};

const EmbeddedCheckout1: React.FC<EmbeddedCheckoutProps> = ({ priceId, quantity,productName,packagetype }) => {

  const AdvUrl = useSelector((state:RootState) => state.authentication.apiURL);
  const acc_id = useSelector((state: RootState) => state.authentication.account_id)
const fetchClientSecret = useCallback(() => {
            // Create a Checkout Session
            const id = acc_id;
            console.log(id,'userid')
            return fetch(`${AdvUrl}/CreateCheckoutSession`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ priceId, quantity,productName,id ,packagetype}),
            })
              .then((res) => res.json())
              .then((data) => data.clientSecret);
          }, []);

  const options = {fetchClientSecret};


  return (
    <div id="checkout">
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={options}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
};

export default EmbeddedCheckout1;
