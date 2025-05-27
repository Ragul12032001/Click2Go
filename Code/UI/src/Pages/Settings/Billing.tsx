import React, { FC, useEffect, useState } from "react";
import { Card, CardHeader, CardContent } from "../../Components/ui/card";
import { Button } from "../../Components/ui/button";
import { Progress } from "../../Components/ui/progress";
import { Toaster } from "../../Components/ui/toaster";
import { toast, useToast } from "../../Components/ui/use-toast";
import { Input } from "../../Components/ui/input";
import html2pdf from "html2pdf.js";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../Components/ui/table";
import { Badge } from "../../Components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../Components/ui/avatar";
import { CaretSortIcon, DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Box, Modal, Typography, IconButton } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import CloseIcon from "@mui/icons-material/Close"; // Import Close Icon

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../../Components/ui/dropdown-menu";
import EmbeddedCheckout1 from "./EmbeddedCheckout1";
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/src/State/store";
import {
  Elements,
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
// import { loadStripe } from "@stripe/stripe-js";
// import ReactDOM from "react-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../Components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../Components/ui/popover";
import { CreditCardIcon, PhoneIcon, Plus, PlusIcon, ShieldCheck, Wallet } from "lucide-react";
import PhonePeEmbeddedCheckout from "./PhonePeEmbeddedCheckout";

import {
  setSentCount,
  setTotalAvailableCount,
} from "../../../src/State/slices/AdvertiserAccountSlice";
import { useNavigate } from "react-router-dom";

// import { Popover, PopoverContent, PopoverTrigger } from "@/src/Components/ui/popover";

interface Workspaces {
  workspaceid: number;
  workspace: string;
  billingstatus: string;
  paireddate: string;
  workspaceimage: string;
}

interface Transactions {
  paymentId: string;
  amount: string;
  paymentDate: string;
  symbol: string;
  receipturl: string;
  name: string;
  messages: string;
  fundtype: string;
  planName: string;
}
interface Debitdetials {
  amount: string;
  messagecount: string;
  paymentdate: string;
  symbol: string;
  lastdebited_date: string;
}
interface BillingPlan {
  billing_name: string;
  amount: number;
  features: string;
  symbol: string;
  currency: string;
  permessage: string;
  package_type: string;
}
type EmbeddedCheckoutProps = {
  priceId: any;
  quantity: number;
  productName: string;
};

const PricingToggle = () => {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">(
    "monthly"
  );

  const handleToggle = (value: "monthly" | "annual") => {
    setBillingCycle(value);
  };
};

type BillingDialogProps = {
  open: boolean;
  handleClose: () => void;
  priceId: string;
  quantity: number;
  productName: string;
  packagetype: string;
};
type PhonepeDialogProps = {
  open: boolean;
  handleClose: () => void;
  currency: string;
  amount: number;
  billingname: string;
};
const Modalstyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

// const [searchTerm, setSearchTerm] = useState<string>("");

// export const BillingDialog: FC<BillingDialogProps> = ({
//   open,
//   handleClose,
//   priceId,
//   quantity,
//   productName,
//   packagetype,
// }) => {
//   useEffect(() => {
//     if (!open) {
//       setTimeout(() => {
//         document.body.style.pointerEvents = "";
//       }, 500);
//     }
//   }, [open]);
//   const [next, setNext] = useState(true);
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [billingCycle, setBillingCycle] = useState<"monthly" | "annual" | null>(
//     null
//   );

//   return (
//     <Dialog open={open} onOpenChange={handleClose}>
//       <DialogContent
//         className="m-2"
//         style={{ height: "100%", overflow: "auto" }}
//       >
//         <DialogHeader>
//           <DialogTitle className="font-semibold text-[#09090B] text-[18px]"></DialogTitle>
//           <DialogDescription className="font-medium text-[#71717A] text-[14px]"></DialogDescription>
//         </DialogHeader>
//         {/* Content, e.g., form fields, buttons */}

//         <EmbeddedCheckout1
//           priceId={priceId}
//           quantity={quantity}
//           productName={productName}
//           packagetype={packagetype}
//         />
//       </DialogContent>
//     </Dialog>
//   );
// };
// export const PhonepeDialog: FC<PhonepeDialogProps> = ({
//   open,
//   handleClose,
//   currency,
//   amount,
//   billingname,
// }) => {
//   useEffect(() => {
//     if (!open) {
//       setTimeout(() => {
//         document.body.style.pointerEvents = "";
//       }, 500);
//     }
//   }, [open]);
//   const [next, setNext] = useState(true);
//   return (
//     <Dialog open={open} onOpenChange={handleClose}>
//       <DialogContent className="m-2">
//         <DialogHeader>
//           <DialogTitle className="font-semibold text-[#09090B] text-[18px]"></DialogTitle>
//           <DialogDescription className="font-medium text-[#71717A] text-[14px]">

//           </DialogDescription>
//         </DialogHeader>
//         {/* Content, e.g., form fields, buttons */}

//         <PhonePeEmbeddedCheckout amount={amount} currency={currency} billingname={billingname} />

//       </DialogContent>
//     </Dialog>
//   );
// };

const Billing: FC = () => {
  // const intialWorkspacesList: Workspaces[] = [
  //     { workspace: 'Dubai Mall', paired:'03/02/2024'},
  //     { workspace: 'Emaar', paired:'29/12/2024'},
  // ];
  const toast = useToast();
  // const intialTransactionList: Transactions[] = [
  //   { value: '560,000', message: '+ 400,000', description: 'Platinum Package purchaced, quantity 1', date:'03/02/2024 ∙ 13:32'},
  //   { value: '12,000', message: '- 6000', description: 'Cost for message sent', date:'29/02/2024 ∙ 13:32'},
  // ];
  const [isPrimaryOwner, setIsPrimaryOwner] = useState(false);
  const [annualBillingDetails, setAnnualBillingDetails] = useState<
    BillingPlan[]
  >([]);
  const [monthlyBillingDetails, setMonthlyBillingDetails] = useState<
    BillingPlan[]
  >([]);
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [apiUrlAdvAcc, setApiUrlAdvAcc] = useState("");
  const [workspaceslist, setWorkspaceslist] = useState<Workspaces[]>([]);
  const [apiurlPhonepeAcc, setApiurlPhonepeAcc] = useState("");

  const [sortOrder, setSortOrder] = useState("asc");
  const [packagetype, setpackagetype] = useState<string | null>(null);
  const [currency, setcurrency] = useState<string | null>(null);
  const [billingname, setbillingname] = useState<string | null>(null);
  const [amount, setamount] = useState<number | null>(null);
  const [paymentLink, setPaymentLink] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<BillingPlan | null>(null);
  const [transactionList, setTransactionList] = useState<Transactions[]>([]);
  const [debitList, setdebitList] = useState<Debitdetials[]>([]);
  const [transactionSortOrder, setTransactionSortOrder] = useState("asc");
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);

  const mailId = useSelector(
    (state: RootState) => state.authentication.userEmail
  );
  const [isSorted, setIsSorted] = useState(false);
  const [walletAmount, setWalletAmount] = useState<number>(0);
  const [sentMessages, setSentMessages] = useState<number>(0);
  const [totalPurchasedMessages, setTotalPurchasedMessages] =
    useState<number>(0);
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [isLoading, setIsLoading] = useState(false);
  const workspaceId = useSelector(
    (state: RootState) => state.authentication.workspace_id
  );
  const accountId = useSelector(
    (state: RootState) => state.authentication.account_id
  );

  const [billingCountryCurrency, setBillingCountryCurrency] = useState("");
  const [billingCountryCurrencySymbol, setBillingCountryCurrencySymbol] =
    useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [showAllCredit, setShowAllCredit] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const fetchConfig = async () => {
      try {
        const response = await fetch("/config.json");
        const config = await response.json();
        setApiUrlAdvAcc(config.ApiUrlAdvAcc);
        setApiurlPhonepeAcc(config.ApiurlPhonepeAcc);

      } catch (error) {
        console.error("Error loading config:", error);
      }
    };

    fetchConfig();
  }, []);

  useEffect(() => {
    if (apiUrlAdvAcc) {
      APICALLS();
    }
  }, [apiUrlAdvAcc]);

  const APICALLS = async () => {
    try {
      const merchantOrderId = localStorage.getItem("merchantOrderId");
      const accessToken = localStorage.getItem("accessToken");
      if (merchantOrderId != null && accessToken != null && walletAmount <= 0) {
        await checkPaymentStatus(merchantOrderId, accessToken);
      }
      await fetchBillingDetails();
      await workspaceslists();
      await usertransactionlist();
      await userdebitlist();
      await handleGetWalletAmount();
      await billingcountrycurrencyandsymbol();
      await handleGetMessagesCount();
    } catch {
      console.log("API Execution Failed");
    } finally {
      setIsLoading(false);
    }
  };



  const checkPaymentStatus = async (merchantOrderId: any, accessToken: any) => {
    try {
      const response = await fetch(
        `${apiurlPhonepeAcc}/status/${merchantOrderId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `O-Bearer ${accessToken}`,
          }
        }
      );

      if (!response.ok) throw new Error("Status check failed");

      const data = await response.json();
      console.log("Full payment status data:", data);

      localStorage.removeItem("merchantOrderId");
      localStorage.removeItem("accessToken");

      setPaymentStatus(data.state);

      if (data.state === "COMPLETED") {
        if (
          data.paymentDetails &&
          Array.isArray(data.paymentDetails) &&
          data.paymentDetails.length > 0
        ) {

          const now = new Date();
          const formattedDateTime = now.getFullYear() + '-' +
            String(now.getMonth() + 1).padStart(2, '0') + '-' +
            String(now.getDate()).padStart(2, '0') + ' ' +
            String(now.getHours()).padStart(2, '0') + ':' +
            String(now.getMinutes()).padStart(2, '0') + ':' +
            String(now.getSeconds()).padStart(2, '0');

          console.log(formattedDateTime);

          downloadInvoice("Nan", data.orderId, formattedDateTime, data.metaInfo.udf2, data.amount)
          toast.toast({
            title: "Success",
            description: `Payment succeeded for ${data.metaInfo.udf2}`,
          });
        } else {
          console.warn("Missing paymentDetails in responseData");
        }
      } else if (data.state === "PENDING") {
        // Optionally add retry limit or spinner here
        setTimeout(() => checkPaymentStatus(merchantOrderId, accessToken), 5000);
      } else {
        toast.toast({
          title: "Payment Failed",
          description: `State: ${data.state}`,
        });
      }

    } catch (err) {
      console.error("Status check error:", err);
      toast.toast({
        title: "Error",
        description: "Failed to verify payment status",
      });
    }
  };




  console.log("id :" + workspaceId);
  const fetchBillingDetails = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${apiUrlAdvAcc}/GetbillingDetails?workspaceid=${workspaceId}`
      );
      console.log("Response : ", response.data);
      if (response.data.status == "Success") {
        if (
          response.data &&
          (response.data.annualBillingDetails ||
            response.data.monthlyBillingDetails)
        ) {
          setAnnualBillingDetails(response.data.annualBillingDetails);
          setMonthlyBillingDetails(response.data.monthlyBillingDetails);
        } else {
          console.error(
            "Error fetching billing details: response - ",
            response
          );
        }
      }
    } catch (error) {
      console.error("Error fetching billing details:", error);
    }
  };

  const handleGetMessagesCount = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${apiUrlAdvAcc}/GetDebitandCreditMessagesCount?accountId=${accountId}`
      );
      console.log("Response : ", response.data);

      if (
        response.data.status === "Success" &&
        response.data.messages_details.length > 0
      ) {
        const messageDetails = response.data.messages_details[0];
        setSentMessages(messageDetails.sent_messages);
        setTotalPurchasedMessages(messageDetails.total_purchased_messages);
        dispatch(setSentCount(messageDetails.sent_messages));
        dispatch(
          setTotalAvailableCount(messageDetails.total_purchased_messages)
        );
      } else {
        console.error("Error fetching messages count: response - ", response);
        setSentMessages(0);
        setTotalPurchasedMessages(0);
      }
    } catch (error) {
      console.error("Error fetching messages count:", error);
      setSentMessages(0);
      setTotalPurchasedMessages(0);
    } finally {
      setIsLoading(false);
    }
  };
  const handleGetWalletAmount = async () => {
    debugger;
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${apiUrlAdvAcc}/GetWalletAmountByWorkspaceId?workspaceId=${workspaceId}`
      );
      console.log("Response : ", response.data);
      if (response.data.status == "Success") {
        if (response.data.status === "Success" && response.data.walletDetails) {
          setWalletAmount(response.data.walletDetails.totalAmount);
        } else {
          console.error(
            "Error fetching billing details: response - ",
            response
          );
        }
      }
    } catch (error) {
      console.error("Error fetching billing details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const billingcountrycurrencyandsymbol = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${apiUrlAdvAcc}/GetBillingCountryandSymbol?accountid=${accountId}`
      );
      if (response.data.status === "Success") {
        setBillingCountryCurrency(response.data.billingInfo.currencyName);
        setBillingCountryCurrencySymbol(
          response.data.billingInfo.currencySymbol
        );
        console.log("Currency", response.data.billingInfo.currencyName);
      } else {
        console.error(
          "Error fetching workspace details : response - ",
          response
        );
      }
    } catch (error) {
      console.error(
        "Error fetching BillingCountry Currency and symbol:",
        error
      );
    } finally {
      setIsLoading(false);
    }
  };

  const workspaceslists = async () => {
    try {
      debugger;
      setIsLoading(true);
      // const id = localStorage.getItem("userid");
      const response = await axios.get(
        `${apiUrlAdvAcc}/GetBillingWorkspaceDetailsByAccountId?accountid=${accountId}`
      );
      console.log("Response : ", response.data.workspacelist);
      if (response.data.status == "Success") {
        if (response.data && response.data.workspacelist) {
          setWorkspaceslist(response.data.workspacelist);
          console.log("workspace List : ", response.data.workspacelist);
        } else {
          console.error(
            "Error fetching workspace details: response - ",
            response
          );
        }
      }
    } catch (error) {
      console.error("Error fetching workspace details:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const pairworkspace = async (workspaceid: any) => {
    try {
      debugger;
      setIsLoading(true);
      const response = await axios.get(
        `${apiUrlAdvAcc}/pairworkspaceid?accountid=${accountId}&workpaceid=${workspaceid}`
      );
      console.log("Response : ", response.data.workspacelist);
      if (response.data.status == "Success") {
        if (response.data) {
          toast.toast({
            title: "Success",
            description: "workspace paired successfully",
          });
          workspaceslists();
        } else {
          console.error(
            "Error fetching workspace details: response - ",
            response
          );
        }
      }
    } catch (error) {
      console.error("Error fetching workspace details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const unpairworkspace = async (workspaceid: any) => {
    try {
      debugger;
      setIsLoading(true);
      const response = await axios.get(
        `${apiUrlAdvAcc}/unpairworkspaceid?workpaceid=${workspaceid}`
      );
      console.log("Response : ", response.data.workspacelist);
      if (response.data.status == "Success") {
        if (response.data) {
          toast.toast({
            title: "Success",
            description: "workspace unpaired successfully",
          });
          workspaceslists();
        } else {
          console.error(
            "Error fetching workspace details: response - ",
            response
          );
        }
      }
    } catch (error) {
      console.error("Error fetching workspace details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const parseTransactionCustomDate = (dateString: string) => {
    const [datePart, timePart] = dateString.split("∙");
    const [day, month, year] = datePart.trim().split("/");
    return new Date(`${year}-${month}-${day}T${timePart.trim()}`);
  };

  const parseCustomDate = (dateStr: string) => {
    const [day, month, year] = dateStr.trim().split("/");
    return new Date(`${year}-${month}-${day}`);
  };
  

  const formatDescription = (features: string, symbol: string) => {
    debugger;
    // Split the features by commas and process each feature
    let formattedDescription = "Includes: ";
    const formattedFeatures = features.split(",").map((feature) => {
      // If the feature contains "per message", handle it
      if (feature.includes("per message")) {
        debugger;
        const parts = feature.trim().split(" "); // Split into parts (e.g., ["100000", "messages", "per", "message", "1.20"])

        // Ensure the feature contains a price at the end (e.g., "1.20")
        if (parts.length >= 2 && !isNaN(parseFloat(parts[2]))) {
          // Format the feature as "100000 messages, per message ₹ 1.20"
          return ` ${parts[0]} ${parts[1]} ${symbol} ${parts[2]}`;
        } else {
          // If the format is invalid, return the feature unchanged
          return feature;
        }
      } else {
        // If the feature does not include "per message", return it unchanged
        return feature;
      }
    });

    // Join the features back into a single string and return it
    formattedDescription += formattedFeatures.join(", ");

    // Return the formatted description
    return formattedDescription;
  };

  const usertransactionlist = async () => {
    try {
      debugger;
      setIsLoading(true);
      const response = await axios.get(
        `${apiUrlAdvAcc}/GetuserTransaction?accountid=${accountId}`
      );
      console.log("Response : ", response.data.user_transaction);
      setTransactionList(response.data.user_transaction);
      if (response.data.status === "Success") {
        if (response.data) {
          // toast.toast({
          //   title: "Success",
          //   description: "Transaction received successfully",
          // })
          console.log("Transaction Received");
        } else {
          console.error(
            "Error fetching Transaction details: response - ",
            response
          );
        }
      }
    } catch (error) {
      console.error("Error fetching Transaction details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const userdebitlist = async () => {
    try {
      debugger;
      setIsLoading(true);
      const response = await axios.get(
        `${apiUrlAdvAcc}/Getdebitdetails?emailid=${mailId}`
      );
      console.log("Response : ", response.data.user_transaction);

      if (response.data.status == "Success") {
        const transaction = response.data.user_transaction[0]; // Accessing first element

        if (transaction.amount !== 0 && transaction.messagecount !== 0) {
          setdebitList([transaction]);
        } else {
          console.error(
            "Error fetching Transaction details: response - ",
            response
          );
        }
      }
    } catch (error) {
      console.error("Error fetching Transaction details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadInvoice = async (
    id: string,
    paymentId: string,
    transactionDate: string,
    description: string,
    amount: string
  ) => {
    debugger;

    try {
      if (id == "") {
        id = "Nan";
      }

      if (id == "Nan") {
        const logoBase64 =
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABhsAAAYbCAYAAAAGsQssAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAuIwAALiMBeKU/dgAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAACAASURBVHic7N3/r97lXcfx9/W5z4F2QPoFGLh19D7dyiY4t6XDL4HWtT21G4xlCRYX3YZGrWZosobS0zJI7jhpTwtkugV/gEWNUXHFqZvTdHBOT51t/TJwLqRLhqU9HUyyCKHdoD3lnPtz+cPUqc0mtOec677P/Xj8Bc/cv3zu+/PKfV0RAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADMKal0AAD0stahq8+LZyYWnqymLs65b3HVN7UwV9Xi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AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACA7voDzTA18hish68AAAAASUVORK5CYII=";

        const htmlContent = `<div style="font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: auto; border: 1px solid #ccc; border-radius: 8px;">
    
    <!-- Header -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
      <div style="max-width: 65%;">
        <div style="font-size: 22px; font-weight: bold;">AGNO INTEL PRIVATE LIMITED</div>
        <div style="margin-top: 5px; font-size: 12px; line-height: 1.5;">
          Address: Manasarovar, #1, 9C/10A, Second Floor Second Street,<br />
          Ayodhya Colony, Velachery, Chennai, Tamil Nadu 600042
        </div>
      </div>
      <div style="max-width: 30%; text-align: right;">
        <img src="${logoBase64}" alt="Company Logo" style="width: 120px; height: auto;" />
      </div>
    </div>
  
    <!-- Invoice Title -->
    <h1 style="text-align: center; font-size: 26px; margin-bottom: 30px;">Invoice</h1>
  
    <!-- Invoice Metadata -->
    <div style="font-size: 14px; margin-bottom: 30px;">
      <p style="margin: 5px 0;"><strong>Order ID:</strong> ${paymentId}</p>
      <p style="margin: 5px 0;"><strong>Date of issue:</strong> ${transactionDate}</p>
      <p style="margin: 5px 0;"><strong>Date due:</strong> ${transactionDate}</p>
    </div>
  
    <!-- Description Table -->
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 14px;">
      <thead>
        <tr style="background-color: #f5f5f5;">
          <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Description</th>
          <th style="border: 1px solid #ddd; padding: 10px; text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="border: 1px solid #ddd; padding: 10px;">${description}</td>
          <td style="border: 1px solid #ddd; padding: 10px; text-align: right;">${(Number(amount) / 100).toLocaleString("en-IN", {
            style: "currency",
            currency: "INR",
          })}</td>
        </tr>
      </tbody>
    </table>
  
    <!-- Total Section -->
    <div style="text-align: right; font-size: 15px; line-height: 1.8;">
      <p><strong>Subtotal:</strong> ${(Number(amount) / 100).toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
      })}</p>
      <p><strong>Total:</strong> ${(Number(amount) / 100).toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
      })}</p>
      <h2 style="margin-top: 10px;">Amount Due: ${(Number(amount) / 100).toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
      })}</h2>
    </div>
  </div>
  `;

        // 🛠️ Create a hidden container to render HTML string
        const element = document.createElement("div");
        element.innerHTML = htmlContent;
        document.body.appendChild(element); // Temporarily add to DOM (required for html2pdf)

        const opt = {
          margin: 0.5,
          filename: `invoice.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
        };

        // 📥 Generate PDF from the element
        html2pdf()
          .set(opt)
          .from(element)
          .save()
          .then(() => {
            document.body.removeChild(element); // 🧹 Clean up after saving
          });
      } else {
        // Send GET request to your backend endpoint
        const response = await axios.get(
          `${apiUrlAdvAcc}/DownloadInvoicePdf?invoiceId=${id}&paymentId=${paymentId}`,
          {
            responseType: "blob", // Ensure the response is treated as a file
          }
        );

        // Create a Blob from the response
        const blob = new Blob([response.data], { type: "application/pdf" });
        const downloadUrl = window.URL.createObjectURL(blob);

        // Create a link element to initiate download
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = `Invoice_${paymentId}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch (error) {
      console.error("Error downloading receipt:", error);
      alert("Failed to download receipt.");
    }
  };

  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">(
    "monthly"
  );

  const toggleBillingCycle = () => {
    setBillingCycle((prev) => (prev === "monthly" ? "annual" : "monthly"));
  };

  const openPDF1 = () => {
    window.open("/Click2Go%20Policies.pdf", "_blank");
  };
  const downloadInvoice1 = async (url: string) => {
    debugger;
    if (!url) {
      alert("Receipt URL is not available.");
      return;
    }

    const proxyUrl = `http://localhost:5008/proxy/download-receipt?url=${encodeURIComponent(
      url
    )}`;

    try {
      const response = await fetch(proxyUrl);
      if (!response.ok) {
        throw new Error("Failed to fetch the invoice.");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      debugger;
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = "Invoice.pdf";
      document.body.appendChild(link);
      link.click();

      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading invoice:", error);
      alert("Unable to download the invoice.");
    }
  };

  const [productDetails, setProductDetails] = useState(null);

  const [priceId, setPriceId] = useState<string | null>(null);
  const [productName, setproductname] = useState<string | null>();
  // const [clientSecret, setclientSecret] = useState<string | null>();
  const [quantity, setQuantity] = useState<number>(1);
  const [workspaceid, setWorkspaceid] = useState<number>();
  const handlePurchase = async (plan: BillingPlan) => {
    setIsLoading(true);
    try {
      debugger;
      handleOpen();
      setIsModalOpen(false);
      const formattedDescription = formatDescription(
        plan.features,
        plan.symbol
      );
      const data = {
        Amount: plan.amount,
        Currency: plan.currency, // Assuming you have a currency property
        ProductName: plan.billing_name,
        Description: formattedDescription,
      };
      debugger;
      // const response1 = await axios.post(`${apiUrlAdvAcc}/Checkpaymenturl`, data, {

      // });

      // if (response1.data.payment[0].price_id != null) {
      //   debugger;
      //   const price_id = response1.data.payment[0].price_id; // Assuming `url` is returned in the response
      //   setPriceId(price_id);
      //   setQuantity(1);
      //   setproductname(plan.billing_name);

      //   // Open the payment link
      //   // window.location.href = paymenturl;
      // }
      // else {
      debugger;
      const response = await axios.post(
        `${apiUrlAdvAcc}/CreateProductWithPrice`,
        data,
        {
          headers: {
            "Content-Type": "application/json", // Include the token here
          },
        }
      );
      console.log(response.data);
      if (response.data) {
        const { productId, priceId, productName } = response.data;

        console.log(priceId, productName, "product details");

        setPriceId(priceId); // Example Price ID
        setQuantity(1);
        setproductname(productName);
        const packagetype = plan.package_type;
        setpackagetype(packagetype);
        setIsLoading(false);

        navigate("/settings/checkout", {
          state: {
            route: "Billing",
            priceId: priceId,
            quantity: quantity,
            productName: productName,
            packagetype: packagetype,
          },
        });
        //await handleCreatePaymentLink(priceId, productName, quantity)
      }
      // }
    } catch (error) {
      console.error("Error while creating product:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleCreatePaymentLink = async (
    PriceId: any,
    ProductName: any,
    Quantity: number
  ) => {
    try {
      debugger;
      handleOpen();

      const data = {
        PriceId: PriceId,
        Quantity: Quantity,
        ProductName: ProductName,
      };

      // Send the request to CreatePaymentLink API
      const response = await axios.post(
        `${apiUrlAdvAcc}/CreatePaymentLink`,
        data
      );

      if (response.data) {
        const paymentLink = response.data; // Assuming `url` is returned in the response
        const paymentId = response.data.paymentId; // Assuming paymentId is returned as well

        // Open the payment link
        //   window.location.href = paymentLink;
      }
    } catch (error) {
      console.error("Error while creating payment link:", error);
    }
  };

  const handlePurchase1 = async (plan: BillingPlan) => {
    debugger;
    handleOpen();
    setIsModalOpen(false);
    const billingname = plan.billing_name;
    const amount = plan.amount;
    const currency = plan.currency;
    const package_type = plan.package_type;

    setcurrency(currency);
    setbillingname(billingname);
    setamount(amount);
    setpackagetype(package_type);

    // debugger;
    // navigate("/settings/checkout", {
    //   state: {
    //     route: "Billing",
    //     packagetype:package_type,
    //     billingname:billingname,
    //     amount:amount,
    //     currency:currency

    //   }
    // })
  };

  const sortWorkspaces = (tableHeader: string) => {
    let sortedData = [...workspaceslist];
  
    switch (tableHeader) {
      case "Byworkspace":
        sortedData.sort((a, b) =>
          sortOrder === "asc"
            ? a.workspace.localeCompare(b.workspace)
            : b.workspace.localeCompare(a.workspace)
        );
        break;
  
      case "ByPaired":
        sortedData.sort((a, b) =>
          sortOrder === "asc"
            ? parseCustomDate(a.paireddate).getTime() - parseCustomDate(b.paireddate).getTime()
            : parseCustomDate(b.paireddate).getTime() - parseCustomDate(a.paireddate).getTime()
        );
        break;
  
      default:
        console.warn("Unknown table header");
        return;
    }
  
    setWorkspaceslist(sortedData);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };
  

  const formatAmount = (amount: number): string => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  const debitMessageCount = Array.isArray(debitList)
    ? debitList.reduce((sum, item) => sum + Number(item.messagecount || 0), 0)
    : 0;

  const creditMessageCount = Array.isArray(transactionList)
    ? transactionList.reduce((sum, item) => sum + Number(item.messages || 0), 0)
    : 0;
  const sortTransactions = (field: string) => {
    let sortedList = [...transactionList];

    switch (field) {
      case "ByValues":
        sortedList.sort((a, b) =>
          transactionSortOrder === "asc"
            ? a.amount.localeCompare(b.amount)
            : b.amount.localeCompare(a.amount)
        );
        break;

      case "ByMessages":
        sortedList.sort((a, b) =>
          transactionSortOrder === "asc"
            ? a.messages.localeCompare(b.messages)
            : b.messages.localeCompare(a.messages)
        );
        break;

      case "ByDescription":
        sortedList.sort((a, b) =>
          transactionSortOrder === "asc"
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name)
        );
        break;

      case "ByDate":
        sortedList.sort((a, b) =>
          transactionSortOrder === "asc"
            ? parseTransactionCustomDate(a.paymentDate).getTime() -
            parseTransactionCustomDate(b.paymentDate).getTime()
            : parseTransactionCustomDate(b.paymentDate).getTime() -
            parseTransactionCustomDate(a.paymentDate).getTime()
        );
        break;

      default:
        console.warn("Unknown field for sorting");
    }

    setTransactionList(sortedList);
    setTransactionSortOrder(transactionSortOrder === "asc" ? "desc" : "asc");
  };

  const closeModal = () => {
    // Logic to close the modal, e.g., set the modal state to false
    setIsModalOpen(false); // assuming you have a state like setIsOpen to control modal visibility
  };

  return (
    <div>
      <div
        className="flex-col"
        style={{ overflowY: "scroll", height: "100vh" }}
      >
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-gray-500/50 flex items-center justify-center z-50">
            <CircularProgress className="text-primary" />
          </div>
        )}
        <Toaster />
        <Card className="mb-[15px] mt-2">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600 text-left">
                  Total funds
                  {` (${billingCountryCurrency})`}
                  and remaining messages in your wallet
                </p>
              </div>
              {showAddFunds ? (
                <Button
                  className="w-15 text-white mt-0 form-button"
                  onClick={() => {
                    setShowAddFunds(false);
                  }}
                >
                  {" "}
                  Back{" "}
                </Button>
              ) : (
                <Button className="w-15 text-white mt-0 form-button"
                onClick={() => {
                  if (annualBillingDetails.length === 0 && monthlyBillingDetails.length === 0) {
                    toast.toast({
                      title: "Alert",
                      description: "No available plans for your billing country",
                      duration: 3000
                    });
                    return;
                  }

                  if (walletAmount > 0) {
                    toast.toast({
                      title: "Alert",
                      description: "You already have an active plan",
                      duration: 3000
                    });
                    return;
                  }

                  setShowAddFunds(true);
                }}
              >
              <Wallet className="w-4 h-4 mr-2 text-white" /> Add funds
              </Button>

              )}
            </div>

            <div className="flex items-center mt-2">
              <span className="text-3xl font-bold text-gray-900 ml-1">
                {/* {billingDetails.length > 0 ? billingDetails[0].symbol : "د.إ"} */}
                {billingCountryCurrency}
              </span>

              <span className="text-3xl font-bold text-gray-900 ml-1">
                {walletAmount !== null ? walletAmount.toLocaleString() : "0"}
              </span>
              <span className="text-4xl text-gray-200 ml-3"> / </span>
              <div className="ml-4 flex flex-col items-start">
                <span className="text-sm text-gray-800 font-semibold text-left">
                  {sentMessages.toLocaleString()} /{" "}
                  {totalPurchasedMessages.toLocaleString()} Messages
                </span>
                <div className="w-72">
                  <Progress
                    value={(sentMessages / totalPurchasedMessages) * 100}
                    className="h-2 rounded-full  [&>div]:bg-[#1a7727]"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>
        {/* {priceId && <EmbeddedCheckout1 priceId={priceId} quantity={quantity} />} */}
        {/* {priceId && (
          <BillingDialog
            priceId={priceId}
            quantity={quantity}
            productName={productName ?? ""}
            packagetype={packagetype??""}
            open={open}
            handleClose={handleClose}
          />
        )} */}
        {amount && currency && billingname && packagetype && (
          <PhonePeEmbeddedCheckout
            amount={amount}
            currency={currency}
            billingname={billingname}
            packagetype={packagetype}
          />
        )}

        {/* {amount && currency &&<PhonePeEmbeddedCheckout amount={amount} currency={currency}/>}  */}

        {showAddFunds && (
          <div className="flex-col gap-4 mb-18">
            {/* Top Row */}

            <div className="inline-flex rounded-full bg-green-100 p-1">
              <button
                onClick={() => setBillingCycle("annual")}
                className={`px-4 py-1 rounded-full text-sm transition-all ${billingCycle === "annual"
                  ? "bg-white text-green-700 font-semibold"
                  : "text-green-600"
                  }`}
              >
                Annual
              </button>

              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-4 py-1 rounded-full text-sm transition-all ${billingCycle === "monthly"
                  ? "bg-white text-green-700 font-semibold"
                  : "text-green-600"
                  }`}
              >
                Monthly
              </button>
            </div>

            {/* Annual Pricing Div */}
            {billingCycle === "annual" && (
              <div className="flex flex-wrap justify-center gap-4 mt-4 mb-[60px]">
                {annualBillingDetails.map((plan, index) => (
                  <Card
                    key={index}
                    className="p-6 border border-grey text-left w-72"
                  >
                    <Typography
                      component="h3"
                      className="flex flex-col items-center justify-center text-sm font-semibold mb-1 pb-1"
                      style={{ fontWeight: 600, fontSize: "14px" }}
                    >
                      <span className="mb-1">{plan.billing_name}</span>
                      <div className="flex items-center space-x-1 ml-2">
                        {plan.amount !== 0 ? (
                          <>
                            {" "}
                            <span>{plan.symbol}</span>{" "}
                            <span>{formatAmount(plan.amount)}</span>{" "}
                          </>
                        ) : (
                          <span style={{ marginTop: "1rem" }}> </span>
                        )}
                      </div>
                    </Typography>
                    <Typography
                      component="p"
                      className="text-sm text-gray-500 mb-4"
                      style={{ fontSize: "14px" }}
                    >
                      <span style={{ fontWeight: 600 }}>Includes:</span>
                      {plan.features.split(",").map((feature, i) => {
                        const isPerMessage = feature.includes("per message");
                        if (isPerMessage) {
                          const parts = feature.split(" ");
                          return (
                            <div
                              key={i}
                              className="flex items-center space-x-1 mt-1"
                            >
                              <span>✓</span>{" "}
                              <span>
                                {Number(parts[0]).toLocaleString()} {parts[1]}
                              </span>
                              <span>{plan.symbol}</span> <span>{parts[2]}</span>
                            </div>
                          );
                        } else {
                          return (
                            <div
                              key={i}
                              className="flex flex-col space-y-1 mt-1"
                            >
                              <div className="flex items-center space-x-1">
                                <span>✓</span>{" "}
                                <span>
                                  {feature.replace(/\d+/g, (match) =>
                                    Number(match).toLocaleString()
                                  )}{" "}
                                  messages{" "}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <span>✓ </span>
                                <span>  per message</span>
                                <span>{`${plan.symbol}${plan.permessage}`}</span>
                              </div>

                            </div>
                          );
                        }
                      })}
                    </Typography>
                    <Button
                      className="py-1 px-3 text-sm w-full mt-4 form-button"
                      style={{ fontWeight: 500 }}
                      onClick={() => {
                        setSelectedPlan(plan); // ✅ Store the selected plan
                        setIsModalOpen(true); // ✅ Open the modal
                      }}
                    >
                      {" "}
                      Purchase{" "}
                    </Button>{" "}
                  </Card>
                ))}{" "}
              </div>
            )}

            {/* Monthly Pricing Div */}
            {billingCycle === "monthly" && (
              <div className="flex flex-wrap justify-center gap-4 mt-4 mb-[60px]">
                {monthlyBillingDetails.map((plan, index) => (
                  <Card
                    key={index}
                    className="p-6 border border-grey text-left w-72"
                  >
                    <Typography
                      component="h3"
                      className="flex flex-col items-center justify-center text-sm font-semibold mb-1 pb-1"
                      style={{ fontWeight: 600, fontSize: "14px" }}
                    >
                      <span className="mb-1">{plan.billing_name}</span>
                      <div className="flex items-center space-x-1 ml-2">
                        {plan.amount !== 0 ? (
                          <>
                            {" "}
                            <span>{plan.symbol}</span>{" "}
                            <span>{formatAmount(plan.amount)}</span>{" "}
                          </>
                        ) : (
                          <span style={{ marginTop: "1rem" }}> </span>
                        )}
                      </div>
                    </Typography>
                    <Typography
                      component="p"
                      className="text-sm text-gray-500 mb-4"
                      style={{ fontSize: "14px" }}
                    >
                      <span style={{ fontWeight: 600 }}>Includes:</span>
                      {plan.features.split(",").map((feature, i) => {
                        const isPerMessage = feature.includes("per message");
                        if (isPerMessage) {
                          const parts = feature.split(" ");
                          return (
                            <div
                              key={i}
                              className="flex items-center space-x-1 mt-1"
                            >
                              <span>✓</span>{" "}
                              <span>
                                {Number(parts[0]).toLocaleString()} {parts[1]}
                              </span>
                              <span>{plan.symbol}</span> <span>{parts[2]}</span>
                            </div>
                          );
                        } else {
                          return (
                            <div
                              key={i}
                              className="flex flex-col space-y-1 mt-1"
                            >
                              <div className="flex items-center space-x-1">
                                <span>✓</span>{" "}
                                <span>
                                  {feature.replace(/\d+/g, (match) =>
                                    Number(match).toLocaleString()
                                  )}{" "}
                                  messages{" "}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <span>✓ </span>
                                <span>  per message</span>
                                <span>{`${plan.symbol}${plan.permessage}`}</span>
                              </div>


                            </div>
                          );
                        }
                      })}
                    </Typography>
                    <Button
                      className="py-1 px-3 text-sm w-full mt-4 form-button"
                      style={{ fontWeight: 500 }}
                      onClick={() => {
                        setSelectedPlan(plan); // ✅ Store the selected plan
                        setIsModalOpen(true); // ✅ Open the modal
                      }}
                    >
                      {" "}
                      Purchase{" "}
                    </Button>{" "}
                  </Card>
                ))}{" "}
              </div>
            )}

            <Modal
              open={isModalOpen}
              onClose={() => {
                setIsModalOpen(false);
                setSelectedPlan(null); // ✅ Reset when closing
              }}
              aria-labelledby="modal-modal-title"
              aria-describedby="modal-modal-description"
            >
              <Box sx={Modalstyle} position="relative">
                <Typography
                  id="modal-modal-description"
                  sx={{ mt: 2 }}
                  align="center"
                >
                  {/* Stripe Option with Icon in div */}
                  <div
                    className="flex items-center justify-center py-2 px-4 rounded-lg cursor-pointer hover:bg-gray-100 transition"
                    style={{
                      fontWeight: 500,
                      color: "#1a7727",
                      fontSize: "16px",
                    }}
                    onClick={() => selectedPlan && handlePurchase(selectedPlan)}
                  >
                    <img
                      src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjusbdo1GbIWU00SN8Ce6qVPnLOuQM_wAZsA&s"
                      alt="Stripe"
                      style={{
                        width: "24px",
                        height: "24px",
                        marginRight: "10px",
                      }}
                    />
                    Pay through Stripe
                  </div>

                  {/* OR Text */}
                  <Typography
                    variant="body2"
                    sx={{ my: 2, fontWeight: "bold", color: "#777" }}
                  >
                    — OR —
                  </Typography>
                  {/* Phone Pay Option with Icon in div */}
                  <div
                    className="flex items-center justify-center py-2 px-4 rounded-lg cursor-pointer hover:bg-gray-100 transition"
                    style={{
                      fontWeight: 500,
                      color: "#1a7727",
                      fontSize: "16px",
                    }}
                    onClick={() =>
                      selectedPlan && handlePurchase1(selectedPlan)
                    }
                  >
                    <img
                      src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRapYlNmetw9Nf0kFiR9PzoZLiJSzX3LjkKww&s"
                      alt="PhonePe"
                      style={{
                        width: "28px",
                        height: "28px",
                        marginRight: "10px",
                      }}
                    />
                    Pay with PhonePe
                  </div>
                </Typography>
              </Box>
            </Modal>
            <div className="flex items-center justify-end space-x-6">
              <div
                className="fixed bottom-[35px] right-4 bg-orange-500 text-white rounded-full p-3 shadow-md cursor-pointer z-50 form-button"
                onClick={openPDF1}
              >
                <ShieldCheck className="w-5 h-5" />

              </div>
              {/* <Button style={{width:"4%"}}
   title="Toolkit"
    className="text-white mt-0 form-button bg-blue-600 hover:bg-blue-700"
   
  >
     
  <ShieldCheck className="w-4 h-4 text-white" />

    
  </Button> */}
            </div>
          </div>
        )}
        {!showAddFunds && (
          <>
            <Card className="mb-[15px] mt-2">
              <CardHeader>
                <div>
                  <h2 className="text-lg font-bold text-left">Workspaces</h2>
                  <p className="text-sm text-gray-600 text-left">
                    This wallet is linked to the following Workspaces
                  </p>
                </div>{" "}
                <br></br>
              </CardHeader>

              <CardContent>
                <div className="rounded-md border -mt-6">
                  <Table
                    className="rounded-xl whitespace-nowrap border-gray-200"
                    style={{ color: "#020202", fontSize: "14px" }}
                  >
                    <TableHeader className="text-center">
                      <TableRow>
                        <TableHead className="text-left">
                          <div className="flex items-center gap-2 justify-start ml-2">
                            Workspace{" "}
                            <CaretSortIcon
                              onClick={() => sortWorkspaces("Byworkspace")}
                              className="cursor-pointer"
                            />
                          </div>
                        </TableHead>
                        <TableHead>
                          <div className="flex items-center gap-2 justify-end">
                            Paired at{" "}
                            <CaretSortIcon
                              onClick={() => sortWorkspaces("ByPaired")}
                              className="cursor-pointer"
                            />
                          </div>
                        </TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody className="text-left">
                      {workspaceslist.map((workspaceItem, index) => (
                        <TableRow key={index}>
                          <TableCell className="flex items-center space-x-3 py-4 ml-2">
                            <Avatar className="mt-2">
                              <AvatarImage
                                src={`data:image/png;base64,${workspaceItem.workspaceimage}`}
                                alt={workspaceItem.workspace}
                              />
                              <AvatarFallback>
                                {workspaceItem.workspace[0]}
                              </AvatarFallback>
                            </Avatar>
                            <span>{workspaceItem.workspace}</span>
                            {workspaceItem.workspaceid === workspaceId && (
                              <Badge className="ml-2 text-white form-button">
                                You
                              </Badge>
                            )}
                            <Badge className="ml-2 bg-[#DFA548] text-white">
                              {workspaceItem.billingstatus}
                            </Badge>
                          </TableCell>

                          <TableCell className="text-right">
                            <div className="flex items-center gap-2 justify-end">
                              {workspaceItem.paireddate}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger className="ml-2  cursor-pointer">
                                <DotsHorizontalIcon   className="cursor-pointer w-4 h-4" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                className="absolute right-0 mt-0"
                                style={{ width: "60px" }}
                              >
                                {workspaceItem.billingstatus === "Paired" ? (
                                  <DropdownMenuItem
                                    className="mt-0 cursor-pointer"
                                    style={{ color: "red" }}
                                    onClick={() =>
                                      unpairworkspace(workspaceItem.workspaceid)
                                    }
                                  >
                                    Unpair
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem
                                    className="mt-0 cursor-pointer"
                                    onClick={() =>
                                      pairworkspace(workspaceItem.workspaceid)
                                    }
                                  >
                                    Pair
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* { Transactions }  */}
            <Card className="mb-[20px] mt-2">
              <CardHeader>
                <div>
                  <h2 className="text-lg font-bold text-left">Credit Transactions</h2>
                  <p className="text-sm text-gray-600 text-left">
                    Here you can view your credit transctions
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table className="rounded-xl whitespace-nowrap border-gray-200" style={{ color: "#020202", fontSize: "14px" }}>
                    <TableHeader className="text-center">
                      <TableRow>
                        <TableHead className="text-left">Value</TableHead>
                        <TableHead>Messages</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-center">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Array.isArray(transactionList) && transactionList.length > 0 ? (
                        <>
                          {(showAllCredit ? transactionList : transactionList.slice(0, 5)).map((transactionItem, index) => (
                            <TableRow key={index}>
                              <TableCell className="flex items-center space-x-2 py-4 ml-2">
                                <span>{transactionItem.symbol}</span>{" "}
                                <span>{transactionItem.amount}</span>
                                <Badge className="text-white form-button">Credit</Badge>
                              </TableCell>
                              <TableCell className="text-left">
                                +{transactionItem.messages}
                              </TableCell>
                              <TableCell className="text-left">
                                {transactionItem.name} Package purchased
                              </TableCell>
                              <TableCell className="text-left">
                                {transactionItem.paymentDate}
                              </TableCell>
                              <TableCell className="text-center">
                                <DropdownMenu>
                                  <DropdownMenuTrigger className="ml-2 cursor-pointer">
                                  <DotsHorizontalIcon   className="cursor-pointer w-4 h-4" />
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent
                                className="absolute right-0 mt-0"
                               
                              >
                              
                                  <DropdownMenuItem
                                    className="mt-0 cursor-pointer"
                                    style={{ color: "red",  width: "145px" }}
                                    onClick={() =>
                                      downloadInvoice(
                                        transactionItem.receipturl,
                                        transactionItem.paymentId,
                                        transactionItem.paymentDate,
                                        transactionItem.planName,
                                        transactionItem.amount
                                      )
                                    }
                                  >
                                    Download invoice
                                  </DropdownMenuItem>
                               
                                
                              </DropdownMenuContent>
                                  {/* <DropdownMenuContent className="absolute right-0" style={{ width: "145px" }}>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        downloadInvoice(
                                          transactionItem.receipturl,
                                          transactionItem.paymentId,
                                          transactionItem.paymentDate,
                                          transactionItem.planName,
                                          transactionItem.amount
                                        )
                                      }
                                    >
                                      Download invoice
                                    </DropdownMenuItem>
                                  </DropdownMenuContent> */}
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                          {transactionList.length > 5 && (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center py-2">
                                <button
                                  className="text-green-600 hover:underline"
                                  onClick={() => setShowAllCredit(!showAllCredit)}
                                >
                                  {showAllCredit ? "Hide transactions" : "Show more transactions"}
                                </button>
                              </TableCell>
                            </TableRow>
                          )}
                        </>
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-4">
                            No credit transactions available.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>


            <Card className="mb-[100px] mt-2">
              <CardHeader>
                <div>
                  <h2 className="text-lg font-bold text-left">Debit Transaction</h2>
                  <p className="text-sm text-gray-600 text-left">
                    Wallet debits for sent messages
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table className="rounded-xl whitespace-nowrap border-gray-200" style={{ color: "#020202", fontSize: "14px" }}>
                    <TableHeader className="text-center">
                      <TableRow>
                        <TableHead className="text-left">Value</TableHead>
                        <TableHead>Messages</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {debitList.length > 0 ? (
                        <TableRow>
                          <TableCell className="flex items-center space-x-2 py-4 ml-2">
                            <span>{debitList[0].symbol}</span>{" "}
                            <span>{debitList[0].amount}</span>
                            <Badge className="text-white" style={{ backgroundColor: "#660066" }}>Debit</Badge>
                          </TableCell>
                          <TableCell className="text-left">
                            -{debitList[0].messagecount}
                          </TableCell>
                          <TableCell className="text-left">
                            Cost for messages sent
                          </TableCell>
                          <TableCell className="text-left">
                            {debitList[0].lastdebited_date}
                          </TableCell>

                        </TableRow>
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-4">
                            No debit transaction available.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default Billing;
