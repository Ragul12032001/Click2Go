import { FC, useEffect } from "react";
import EmbeddedCheckout1 from "./EmbeddedCheckout1";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../../Components/ui/button";
import PhonePeEmbeddedCheckout from "./PhonePeEmbeddedCheckout";

// type EmbeddedCheckoutProps = {
//     priceId: string;
//     quantity: number;
//     productName: string;
//   };

const Checkout: React.FC = () => {

  const location = useLocation();
  const navigate = useNavigate();

  const priceId = location.state?.priceId || "";
  const quantity = location.state?.quantity || "";
  const productName = location.state?.productName || "";
  const packagetype = location.state?.packagetype || "";
  const billingname = location.state?.billingname|| "";
  const amount = location.state?.amount || "";
  const currency = location.state?.currency || "";

  // useEffect(()=>{
  //     if(location.pathname==="checkout"){

  //     }
  // },[])
  return (
    <>
      <div className="fixed flex justify-end items-end right-0 top-[-15px] z-20 p-4">
        <Button
          onClick={() => {
            navigate("/settings/Billing", { state: { route: "Billing" } });
          }}
          className="w-36 text-sm font-thin h-[35px] mt-[10px] mb-[30px] form-button"
        >
          Back
        </Button>
      </div>
      <div className="flex-col gap-6 max-h-screen overflow-y-auto pl-2 pr-2">
        {/* <EmbeddedCheckout1 priceId={priceId} quantity={quantity} productName={productName}  packagetype={packagetype}  />  */}
        {priceId && quantity && productName && packagetype ? (
  <EmbeddedCheckout1
    priceId={priceId}
    quantity={quantity}
    productName={productName}
    packagetype={packagetype}
  />
) : amount && currency && billingname && packagetype ? (
  <PhonePeEmbeddedCheckout
    amount={amount}
    currency={currency}
    billingname={billingname}
    packagetype={packagetype}
  />
) : (
  <div className="text-center text-gray-500 p-6">No checkout data provided.</div>
)}


      </div>
    </>
  )
}

export default Checkout;