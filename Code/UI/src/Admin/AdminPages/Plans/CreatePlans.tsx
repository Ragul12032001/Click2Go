import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { ToastContainer } from "react-toastify";
import { Toaster } from "../../../Components/ui/toaster";
import { setCreateBreadCrumb } from "../../../State/slices/AdvertiserAccountSlice";
import { Button } from "../../../Components/ui/button";
import { Card } from "../../../Components/ui/card";
import { Label } from "../../../Components/ui/label";
import { useToast } from "../../../Components/ui/use-toast";
import { Switch } from "../../../Components/ui/switch";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectContent,
  SelectValue,
} from "../../../Components/ui/select";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "src/Components/ui/dialog";
import { Input } from "../../../Components/ui/input";
import { Currency } from "lucide-react";
import axios from "axios";
import CircularProgress from "@mui/material/CircularProgress";

const CreatePlans: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const plansList = location.state?.plansList || [];

  console.log("Received Plans List:", plansList);
  const toast = useToast();
  const [apiUrlAdvAcc, setApiUrlAdvAcc] = useState("");
  // const planId = location.state?.planId || "";
  const {
    planId,
    name,
    messages,
    per_message,
    price,
    countrySymbol: initialCurrency,
    package_type,
  } = location.state || {};

  const [planName, setPlanName] = useState<string>("");
  const [planMessage, setPlanMessage] = useState<string>("");
  const [permessage, setPerMessage] = useState<string>("");
  const [planPrice, setPlanPrice] = useState<string>("");
  const [packagetype, setpackagetype] = useState<string>("");
  const [countrySymbol, setCountrySymbol] = useState<string>(
    planId ? initialCurrency || "USD" : "USD"
  );
  const [updateCurrency, setUpdateCurrency] = useState<string>("");
  const currentTime = new Date().toISOString();
  const [currencyList, setCurrencyList] = useState<string[]>([]);
  const [planNameError, setPlanNameError] = useState("");
  const [planMessageError, setPlanMessageError] = useState("");
  const [perMessageError, setPerMessageError] = useState("");
  const [planPriceError, setPlanPriceError] = useState("");
  const [countrySymbolError, setCountrySymbolError] = useState("");
  const [displayplanPrice, setDisplayPlanPrice] = useState<string>("");
  const [displayplanMessage, setDisplayPlanMessage] = useState<string>("");

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch("/config.json");
        const config = await response.json();
        setApiUrlAdvAcc(config.ApiUrlAdvAcc);
      } catch (error) {
        console.error("Error loading config:", error);
      }
    };

    fetchConfig();
  }, []);

  useEffect(() => {
    if (planId) {
      console.log("planId --- ", planId);
      setPlanName(name || "");
      const numberOnly = messages.match(/\d+/g)?.join('') || "";
      setPlanMessage(numberOnly);
      setPlanPrice(price || "");
      setPerMessage(per_message || "");
      setCountrySymbol(initialCurrency || "USD");
      setBillingCycle(package_type||"s");
    }
  }, [planId, name, messages, per_message, price, initialCurrency,package_type]);

  useEffect(() => {
    debugger;
    const fetchCurrencyList = async () => {
      try {
        const response = await axios.get(`${apiUrlAdvAcc}/GetCurrencyNames`);
        debugger;
        if (response.data.status === "Success") {
          setCurrencyList(response.data.currencyList || []);
        } else {
          console.error(
            "Failed to fetch currency list:",
            response.data.status_description
          );
        }
      } catch (error) {
        console.error("Error fetching currency list:", error);
      }
    };

    if (apiUrlAdvAcc) {
      fetchCurrencyList();
    }
  }, [apiUrlAdvAcc]);

  useEffect(() => {
    // Calculate per-message price dynamically
    const calculatePerMessage = () => {
      const priceValue = parseFloat(planPrice);
      const messagesValue = parseFloat(planMessage);
      if (!isNaN(priceValue) && !isNaN(messagesValue) && messagesValue > 0) {
        setPerMessage((priceValue / messagesValue).toFixed(2));
        setPerMessageError("");
      } else {
        setPerMessage("");
      }
    };
    calculatePerMessage();
  }, [planPrice, planMessage]);

  const handlePlanNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const firstChar = value.charAt(0);
    const firstCharRegex = /^[a-zA-Z]/; // Allows letters and numbers

    const middleRegex = /^[A-Za-z\s]+$/;
    // Last character should NOT be a special character (letters & numbers allowed)
    const lastChar = value.charAt(value.length - 1);
    const lastCharRegex = /^[a-zA-Z]$/; // Allows letters and numbers

    // Ensure spaces are allowed in between but not at the start or end
    if (!firstCharRegex.test(firstChar)) {
      setPlanNameError("First character should not be a special character.");
    } else if (!middleRegex.test(value)) {
      setPlanNameError("Only letters and spaces are allowed.");
    } else if (!lastCharRegex.test(lastChar)) {
      setPlanNameError(
        "Last character should not be a special character or empty space."
      );
    } else {
      setPlanNameError("");
    }

    setPlanName(value);
  };

  const handlePlanMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/,/g, ""); // Remove existing commas
    if (/^\d*$/.test(value)) {
      setPlanMessage(value);
      setDisplayPlanMessage(Number(value).toLocaleString());
      setPlanMessageError(""); // Clear error when valid input
    } else {
      setPlanMessageError("Only numbers are allowed.");
    }
  };
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">(
    "monthly"
  );

  const handleToggle = (value: "monthly" | "annual") => {
    setBillingCycle(value);
  };

  const handlePerMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setPerMessage(value);
      setPerMessageError("");
    } else {
      setPerMessageError("Only numbers are allowed.");
    }
  };

  const handlePlanPriceChange = (num: string) => {
    let value = num.replace(/,/g, ""); // Remove existing commas
    console.log("PLAN PRICE :", Number(value));

    let maximumValue = 999999;
    if (Number(value) > maximumValue) {
      setPlanPriceError("Price should not be exeed 999,999");
      setDisplayPlanPrice(Number(value).toLocaleString()); // Format with commas
      return;
    }
    if (/^\d*$/.test(value)) {
      setPlanPrice(value);
      setDisplayPlanPrice(Number(value).toLocaleString()); // Format with commas
      setPlanPriceError("");
    } else {
      setPlanPriceError("Only numbers are allowed.");
    }
  };

  const handleCountrySymbolChange = (value: string) => {
    if (!value.trim()) {
      setCountrySymbolError("Please select a currency.");
    } else {
      setCountrySymbolError(""); // Clear error if valid
    }

    setCountrySymbol(value);
  };

  const handleEdit = async () => {
    let isValid = true;
    setPlanNameError("");
    setPlanMessageError("");
    setPerMessageError("");
    setPlanPriceError("");
    setCountrySymbolError("");

    const firstCharRegex = /^[A-Za-z]/;
    const middleRegex = /^[A-Za-z\s]+$/;
    const lastCharRegex = /^[A-Za-z]$/;

    const firstChar = planName.charAt(0);
    const lastChar = planName.charAt(planName.length - 1);

    if (!planName.trim()) {
      setPlanNameError("Plan name is required.");
      isValid = false;
    } else if (!firstCharRegex.test(firstChar)) {
      setPlanNameError("First character should be a letter.");
      isValid = false;
    } else if (!middleRegex.test(planName)) {
      setPlanNameError("Only letters and spaces are allowed.");
      isValid = false;
    } else if (!lastCharRegex.test(lastChar)) {
      setPlanNameError("Last character should be a letter.");
      isValid = false;
    }

    if (!planName) {
      setPlanNameError("Plan name is required.");
      isValid = false;
    }
    if (!planMessage) {
      setPlanMessageError("Included messages are required.");
      isValid = false;
    }
    if (!permessage) {
      setPerMessageError("Per message price is required.");
      isValid = false;
    }
    if (!planPrice) {
      setPlanPriceError("Price is required.");
      isValid = false;
    }
    if (!countrySymbol) {
      setCountrySymbolError("Currency is required.");
      isValid = false;
    } else {
      setCountrySymbolError(""); // Clear error if valid
    }

    if (!isValid) {
      console.log("Form is invalid, submission prevented.");
      return; // Prevent form submission if validation fails
    }
    console.log("Editing plan:", {
      planId,
      planName,
      planMessage,
      permessage,
      planPrice,
      countrySymbol,
      billingCycle
    });

    const data = {
      billingId: planId,
      messages: planMessage,
      price: planPrice,
      countrySymbol: countrySymbol,
      permessage: permessage,
      name: planName,
      package_type:billingCycle
        };
    console.log("Edit plan data: ", data);
    setIsLoading(true);
    const response = await axios.put(
      `${apiUrlAdvAcc}/UpdateBillingFeature`,
      data
    );

    if (response.data.status === "Success") {
      console.log("Plan updated successfully");
      toast.toast({
        title: "Success.",
        description: "Plans updated Successfully.",
        duration: 3000,
      });
      setIsLoading(false);
      setTimeout(() => {
        dispatch(setCreateBreadCrumb(false));
        navigate("/adminNavbar/plans");
      }, 1000);
    } else {
      console.error("Upload failed:", response.data.Status_Description);
      toast.toast({
        title: "Success.",
        description: "Plans update Failed!.",
        duration: 3000,
      });
      setIsLoading(false);
    }
  };

  const handleNameValidation = () => {
    const isExist = plansList.some(
      (plan: any) =>
        (plan.countrySymbol?.trim() || "").toLowerCase() ===
          (countrySymbol?.trim() || "").toLowerCase() &&
        (plan.name?.trim() || "").toLowerCase() ===
          (planName?.trim() || "").toLowerCase() &&
          (plan.package_type?.trim() || "").toLowerCase() ===  (billingCycle?.trim() || "").toLowerCase() 
    );
    if (isExist) {
      setPlanNameError("Plan name already existed for this currency label");
      return true;
    } else {
      setPlanNameError("");
      return false;
    }
  };

  const handleSubmit = async () => {
    let isValid = true;
    if (handleNameValidation()) {
      return;
    }
    if (
      planNameError ||
      planMessageError ||
      perMessageError ||
      planPriceError ||
      countrySymbolError
    ) {
      toast.toast({
        title: "Invalid Input",
        description:
          "Please check the highlighted fields and provide valid information.",
        duration: 2000, // Optional: Toast will disappear after 4 seconds
      });
      return;
    }

    setPlanNameError("");
    setPlanMessageError("");
    setPerMessageError("");
    setPlanPriceError("");
    setCountrySymbolError("");

    const firstCharRegex = /^[A-Za-z]/;
    const middleRegex = /^[A-Za-z\s]+$/;
    const lastCharRegex = /^[A-Za-z]$/;

    const firstChar = planName.charAt(0);
    const lastChar = planName.charAt(planName.length - 1);

    if (!planName.trim()) {
      setPlanNameError("Plan name is required.");
      isValid = false;
    } else if (!firstCharRegex.test(firstChar)) {
      setPlanNameError("First character should be a letter.");
      isValid = false;
    } else if (!middleRegex.test(planName)) {
      setPlanNameError("Only letters and spaces are allowed.");
      isValid = false;
    } else if (!lastCharRegex.test(lastChar)) {
      setPlanNameError("Last character should be a letter.");
      isValid = false;
    }

    if (!planName) {
      setPlanNameError("Plan name is required.");
      isValid = false;
    }
    if (!planMessage) {
      setPlanMessageError("Included messages are required.");
      isValid = false;
    }
    if (!permessage) {
      setPerMessageError("Per message price is required.");
      isValid = false;
    }
    if (!planPrice) {
      setPlanPriceError("Price is required.");
      isValid = false;
    }
    if (!countrySymbol) {
      setCountrySymbolError("Currency is required.");
      isValid = false;
    } else {
      setCountrySymbolError(""); // Clear error if valid
    }

    if (!isValid) {
      console.log("Form is invalid, submission prevented.");
      return; // Prevent form submission if validation fails
    }
    console.log("Creating new plan:", {
      planName,
      planMessage,
      planPrice,
      permessage,
      countrySymbol,
      billingCycle
    });
    const data = {
      messages: planMessage,
      price: planPrice,
      countrySymbol: countrySymbol,
      permessage: permessage,
      name: planName,
      package_type: billingCycle
    };
    console.log("New plan: ", data);
    setIsLoading(true);
    const response = await axios.post(
      `${apiUrlAdvAcc}/InsertBillingFeature`,
      data
    );
    if (response.data.status === "Success") {
      console.log("Plan created successfully");
      toast.toast({
        title: "Success.",
        description: "Plans Created Successfully.",
        duration: 3000,
      });
      setIsLoading(false);
      setTimeout(() => {
        dispatch(setCreateBreadCrumb(false));
        navigate("/adminNavbar/plans");
      }, 1000);
    } else {
      console.error("Upload failed:", response.data.Status_Description);
      toast.toast({
        title: "Success.",
        description: "Plans creation Failed!.",
        duration: 3000,
      });
      setIsLoading(false);
    }
  };

  const handleDiscard = () => {
    dispatch(setCreateBreadCrumb(false));
    navigate("/adminNavbar/plans");
    setIsDialogOpen(false);
  };

  const discardMessage = planId
    ? "Do you want to discard the plan's update?" // If editing
    : "Do you want to discard the plan?";

  return (
    <>
      <div className="overflow-y-auto ml-[-7px]">
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-gray-500/50 flex items-center justify-center z-50">
            <CircularProgress className="text-primary" />
          </div>
        )}
        <Toaster />
        <div className="fixed flex justify-end gap-4 mr-[40px] items-end right-[0px] top-[-15px] z-20 ">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="w-[70px] px-3 py-1 text-sm border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                variant="outline"
              >
                Discard
              </Button>
            </DialogTrigger>
            <DialogContent className="p-6 mx-auto">
              <DialogTitle className="text-18px font-semibold text-[#09090B] mb-2">
                Discard Changes
              </DialogTitle>
              <DialogDescription className="text-14px font-medium text-[#71717A]">
                {discardMessage}
              </DialogDescription>
              <div className="flex justify-end gap-4">
                <Button
                  variant="outline"
                  className="px-4 py-2 w-24"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="w-24 px-3 py-1 text-sm bg-red-500 text-white hover:bg-red-600"
                  onClick={handleDiscard}
                >
                  Discard
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            className="w-[80px] text-[#F8FAFC] form-button"
            onClick={() => (planId ? handleEdit() : handleSubmit())}
          >
            {planId ? "Update" : "Submit"}
          </Button>
        </div>

        <div className="ml-4">
          <Card className="w-[580px] mt-2 p-4">
            <div className="text-left">
              {/* Header row with title and toggle buttons */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-md font-semibold">
                  {planId ? "Edit Plan" : "Add New Plan"}
                </h3>

                {/* Toggle Buttons */}
                <div className="inline-flex rounded-full bg-green-100 p-1">
                  <button
                    onClick={() => setBillingCycle("annual")}
                    className={`px-4 py-1 rounded-full text-sm transition-all ${
                      billingCycle === "annual"
                        ? "bg-white text-green-700 font-semibold"
                        : "text-green-600"
                    }`}
                  >
                    Annual
                  </button>
                  <button
                    onClick={() => setBillingCycle("monthly")}
                    className={`px-4 py-1 rounded-full text-sm transition-all ${
                      billingCycle === "monthly"
                        ? "bg-white text-green-700 font-semibold"
                        : "text-green-600"
                    }`}
                  >
                    Monthly
                  </button>
                </div>
              </div>

              {/* You can continue the rest of your plan form UI here */}

              <div className="mt-4">
                <Label htmlFor="planName" className="mt-8">
                  {" "}
                  Name{" "}
                </Label>
                <Input
                  id="planName"
                  type="text"
                  placeholder="e.g. Executive"
                  value={planName}
                  onChange={handlePlanNameChange}
                  className="mt-2 text-gray-500"
                />
                {planNameError && (
                  <p className="text-red-500 text-xs font-medium mt-1 mb-2 font-sans italic ml-1">
                    {" "}
                    {planNameError}{" "}
                  </p>
                )}
              </div>

              <div className="mt-4">
                <Label htmlFor="planMessage" className="mt-2">
                  {" "}
                  Included Messages{" "}
                </Label>
                <Input
                  id="planMessage"
                  type="text"
                  placeholder="e.g. 100,000"
                  value={planMessage}
                  onChange={handlePlanMessageChange}
                  className="mt-2 text-gray-500"
                />
                {planMessageError && (
                  <p className="text-red-500 text-xs font-medium mt-1 mb-2 font-sans italic ml-1">
                    {" "}
                    {planMessageError}{" "}
                  </p>
                )}
              </div>

              <div className="mt-4">
                <Label htmlFor="permessage" className="mt-2">
                  {" "}
                  Per Message Price{" "}
                </Label>
                <Input
                  id="per_message"
                  type="text"
                  placeholder="e.g. 1.0"
                  value={permessage}
                  onChange={handlePerMessageChange}
                  className="mt-2 text-gray-500 cursor-not-allowed"
                  readOnly
                />
                {perMessageError && (
                  <p className="text-red-500 text-xs font-medium mt-1 mb-2 font-sans italic ml-1">
                    {" "}
                    {perMessageError}{" "}
                  </p>
                )}
              </div>

              <div className="mt-4">
                <Label htmlFor="planPrice" className="mt-2">
                  {" "}
                  Price{" "}
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="planPrice"
                    type="text"
                    placeholder="$1,000"
                    value={planPrice}
                    onChange={(e) => handlePlanPriceChange(e.target.value)}
                    className="mt-2 text-gray-500"
                  />

                  <Select
                    value={countrySymbol}
                    onValueChange={(value) => {
                      handleCountrySymbolChange(value);
                    }}
                  >
                    <SelectTrigger className="text-gray-500 mt-2">
                      <SelectValue
                        className="text-gray-500"
                        placeholder={planId ? updateCurrency : ""}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {currencyList.map((currency) => (
                        <SelectItem
                          className="text-gray-500 cursor-pointer"
                          key={currency}
                          value={currency}
                        >
                          {currency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {countrySymbolError && (
                    <p className="text-red-500 text-xs font-medium mt-1 mb-2 font-sans italic ml-1">
                      {" "}
                      {countrySymbolError}{" "}
                    </p>
                  )}
                </div>
                {planPriceError && (
                  <p className="text-red-500 text-xs font-medium mt-1 mb-2 font-sans italic ml-1">
                    {" "}
                    {planPriceError}{" "}
                  </p>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

export default CreatePlans;

