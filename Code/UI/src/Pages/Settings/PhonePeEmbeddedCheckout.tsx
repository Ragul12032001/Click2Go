import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../src/State/store";
import { Button } from "../../../src/Components/ui/button";
import { useNavigate } from "react-router-dom";
declare global {
  interface Window {
    PhonePe?: {
      init: (options: any) => void;
      open: () => void;
    };
    PhonePeCheckout: any;
  }
}

type EmbeddedCheckoutProps = {
  amount: number;
  currency: string;
  billingname: string;
  packagetype: string;
};

const PhonePeEmbeddedCheckout: React.FC<EmbeddedCheckoutProps> = ({
  amount,
  currency,
  billingname,
  packagetype,
}) => {
  const AdvUrl = useSelector((state: RootState) => state.authentication.apiURL);

  const acc_id = useSelector(
    (state: RootState) => state.authentication.account_id
  );
  const [apiUrlAdvAcc, setApiUrlAdvAcc] = useState<string | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [sdkReady, setSdkReady] = useState<boolean>(false);

  const navigate = useNavigate();

  // const email = useSelector((state:RootState)=>state.authentication.userEmail);
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://mercury.phonepe.com/web/bundle/checkout.js";
    script.async = true;
    //script.crossOrigin = "anonymous"; // ✅ Add this line
    script.onload = () => {
      console.log("✅ PhonePe SDK loaded");
      setSdkReady(true);
    };
    script.onerror = () => {
      console.error("❌ Failed to load PhonePe SDK");
    };
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    debugger;
    const fetchConfigAndPaymentUrl = async () => {
      try {
        const id = acc_id;
        console.log(id, "userid");
        // ✅ Load config.json
        const response = await fetch("/config.json");
        const config = await response.json();
        console.log("Config Data:", config);
        setApiUrlAdvAcc(config.ApiurlPhonepeAcc);

        // ✅ Ensure AdvUrl and API URL are available before fetching payment URL
        if (!AdvUrl || !config.ApiUrlAdvAcc) {
          console.error("API URLs are not available yet.");
          return;
        }

        // ✅ Fetch Payment URL
        const paymentResponse = await fetch(
          `${config.ApiurlPhonepeAcc}/initiate`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              Amount: amount,
              Currency: currency,
              Userid: id,
              plan: billingname,
              packagetype: packagetype,
              RedirectUrl: "http://localhost:3000/settings/Billing",
            }),
          }
        );
        const data = await paymentResponse.json();
        console.log(data, "status"); // log the response to check any errors

        if (data.redirectUrl) {
          localStorage.setItem("merchantOrderId",data.transactionId);
          localStorage.setItem("accessToken",data.accessToken);
          setPaymentUrl(data.redirectUrl);
          var tokenUrl = data.redirectUrl;
          window.PhonePeCheckout.transact({
            tokenUrl,
            callback: (response: any) => {
              console.log("PhonePe Response:", response);
            },
            type: "REDIRECT",
          });
        } else {
          console.error("Failed to get payment URL");
        }
      } catch (error) {
        console.error("Error fetching config or payment URL:", error);
      }
    };

    fetchConfigAndPaymentUrl(); // ✅ Call the function inside useEffect
  }, [AdvUrl, amount, currency, billingname, packagetype]); // ✅ Dependencies

  return (
    <div id="checkout">
      {paymentUrl ? (
        <iframe
          src={paymentUrl}
          width="100%"
          height="600px"
          style={{ border: "none" }}
          title="PhonePe Checkout"
        />
      ) : (
        <p>Loading Payment Page...</p>
      )}
      {paymentStatus && <p>Payment Status: {paymentStatus}</p>}
    </div>
  );
};

export default PhonePeEmbeddedCheckout;
