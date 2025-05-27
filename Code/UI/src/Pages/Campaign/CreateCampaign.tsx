import { Button } from "../../Components/ui/button";
import { Card } from "../../Components/ui/card";
import { Label } from "../../Components/ui/label";
import {Select,SelectItem,SelectTrigger,SelectContent,SelectValue,} from "../../Components/ui/select";
import { CircularProgress } from "@mui/material";
import { Input } from "../../Components/ui/input";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { useState, SetStateAction, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; 
import { faArrowTrendUp } from "@fortawesome/free-solid-svg-icons";
import { Tabs, TabsContent } from "../../Components/ui/tabs";
import axios from "axios";
import { useToast } from "../../Components/ui/use-toast";
import { Toaster } from "../../Components/ui/toaster";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { CalendarIcon } from "@radix-ui/react-icons";
import { addDays, format, startOfMonth } from "date-fns";
import { DateRange } from "react-day-picker";
import { Calendar } from "../../Components/ui/calendar";
// import { MultiSelect_RoamingCountry } from "../../Components/ui/multi-select-RoamingCountry";
// import { MultiSelect_TargetCountry } from "../../Components/ui/multi-select-TargetCountry";
import { MultiSelect } from "../../Components/ui/multi-select";
import { Switch } from "../../Components/ui/switch";
import {Popover,PopoverContent,PopoverTrigger,} from "../../Components/ui/popover";
import { cn } from "../../lib/utils";
import { useDispatch, useSelector } from "react-redux";
import { setCreateBreadCrumb , setTargetCountry , setCreateCampaign} from "../../State/slices/AdvertiserAccountSlice";
import { RootState } from "@/src/State/store";
import { FaPaperPlane } from "react-icons/fa";
import { LuPlane } from "react-icons/lu";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../Components/ui/dialog";
import { MultiSelectFromCountry } from "../../Components/ui/multi-select-from-country";
import { MultiSelectToCountry } from "../../Components/ui/multi-select-to-country";
import {
  setDraftedCampaign,
  clearDraftedCampaign,
} from "../../State/slices/CampaignSlice";

interface AudienceCardProps {
  selectedRecipients: number;
  totalRecipients: number;
}

interface Country {
  country_id: number;
  country_name: string;
}

interface multiselect {
  country_id: string;
}
interface SenderDetail {
  sender_id: string; // or number, depending on your data
}

interface Template {
  template_id: number;
  template_name: string;
  channel_type: string;
}

interface Channel {
  channelId: number;
  channelName: string;
}

interface CheckedChannel {
  channelId: number;
  channelName: string;
}

interface Age {
  id: number;
  age: number;
}

interface Gender {
  id: number;
  gender: string;
}

interface IncomeLevel {
  id: number;
  income_level: string;
}

interface Location {
  id: number;
  location: string;
  city: string;
}

interface Interest {
  id: number;
  interest: string;
}

interface Behaviour {
  id: number;
  behaviour: string;
}

interface Device {
  id: number;
  device: string;
}

interface OS {
  id: number;
  os_device: string;
}

interface DatePickerWithRangeProps {
  className?: string;
}

interface Audience {
  list_id: number;
  listname: string;
  created_date: string;
  total_people: number;
  status?: string;
}

type ShortCodeEntry = {
  smppId: number;
  smsConnectionId: number;
  smsNumber: string;
};

interface BillingCountry {
  workspace_info_id: number;
  workspace_name: string;
  country_id: number;
  country_name: string;
  currency_name: string;
  symbol: string;
}

interface PhNoList {
    id : number,
    phone_name: string,
    phone_number : string
}

interface Notification {
  id: number;
  campaignId: number;
  statusMark: string;
  notificationType: string;
  createdAt: string;
  notificationData: {
    Comment?: string;
    [key: string]: string | undefined;
  };
  role: string;
}


export interface WhatsAppBusinessAccount {
  id: string;
  display_phone_number: string;
}


const DatePickerWithRange: React.FC<DatePickerWithRangeProps> = ({
  className,
}) => {
  const [date, setDate] = useState<{ from: Date; to: Date }>({
    from: startOfMonth(new Date()), // First day of the current month
    to: new Date(), // Today
  });

  return (
    <div className={className}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={`w-[254px] justify-start text-left font-normal mt-0 ${
              !date.from && !date.to ? "text-muted-foreground" : ""
            }`}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date.from ? (
              date.to ? (
                `'dd-mm-yyyy'`
              ) : (
                format(date.from, "dd-MM-yyyy")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            selected={date}
            onSelect={(range) => setDate(range as { from: Date; to: Date })}
            numberOfMonths={1}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default function CreateCampaign() {

  const [campaignName, setCampaignName] = useState<string>("");
  const [channelList, setChannelList] = useState<Channel[]>([]); 
  const [checkedChannels, setCheckedChannels] = useState<CheckedChannel[]>([]);
  const [templatefilterlist, setTemplatefilterlist] = useState<Template[]>([]);
  const [channel, setChannel] = useState("");
  const [templateList, setTemplateList] = useState<Template[]>([]);
  const [audienceList, setAudienceList] = useState<Audience[]>([]);
  const [template, setTemplate] = useState("");
  const [phoneNumberList, setPhoneNumberList] = useState<PhNoList[]>([]);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedPhoneName, setSelectedPhoneName] = useState(""); // Store selected phone name (for display)
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState(""); // Store actual phone number (for API)

  const [reachPeopleFrom, setReachPeopleFrom] = useState<string[]>([]);
  const [reachPeopleIn, setReachPeopleIn] = useState<string[]>([]);
  const [campaignBudget, setCampaignBudget] = useState<string>("");
  const [FcampaignBudget, setFCampaignBudget] = useState<string>("");
  const [campaignStartDate, setCampaignStartDate] = useState<string>("");
  const [FcampaignStartDate, setFCampaignStartDate] = useState<string>("");
  const [campaignEndDate, setCampaignEndDate] = useState<string>("");
  const [FcampaignEndDate, setFCampaignEndDate] = useState<string>("");
  const [countryList, setCountryList] = useState<Country[]>([]);
  const [targetCountryList, setTargetCountryList] = useState<Country[]>([]); // New state
  const [roamingCountryList, setRoamingCountryList] = useState<Country[]>([]);
  const [updateChannel, setUpdateChannel] = useState("");
  const [updateTemplate, setUpdateTemplate] = useState("");
  const [updateSenderId, setUpdateSenderId] = useState("");
  const [updateCountry, setUpdateCountry] = useState("");
  const [updateRoamingCountry, setUpdateRoamingCountry] = useState("");
  const [updateCountryId,setUpdateCountryId] = useState<string>("");
  const [updateRoamingCountryId,setUpdateRoamingCountryId]= useState<string>("");
  const [isLoading, setLoading] = useState(true);
  const [isCardLoading, setIsCardLoading] = useState(false);
const navigate = useNavigate();                                                                       
  const location = useLocation();
  const campaignNames = location.state?.campaignNames || []; 
  const campaignId = location.state?.campaignId || "";
  const channelName = location.state?.channelType || "";
  const [campaignNameError, setCampaignNameError] = useState<string | null>( null);
  const [channelError, setChannelError] = useState<string | null>(null);
  const [senderIDError, setSenderIDError] = useState<string | null>(null);
  const [templateError, setTemplateError] = useState<string | null>(null);
  const [phoneNumberError, setPhoneNumberError] = useState<string | null>(null);
  const [AudienceError, setAudienceError] = useState<string | null>(null);
  const [budgetError, setBudgetError] = useState<string | null>(null);
  const [FbudgetError, setFBudgetError] = useState<string | null>(null);
  const [startdateError, setStartDateError] = useState<string | null>(null);
  const [enddateError, setEndDateError] = useState<string | null>(null);
  const [FstartdateError, setFStartDateError] = useState<string | null>(null);
  const [FenddateError, setFEndDateError] = useState<string | null>(null);
  const [targetCountryError, setTargetCountryError] = useState<string | null>(null);
  const [roamingCountryError, setRoamingCountryError] = useState<string | null>( null);
  const [apiUrlAdvAcc, setApiUrlAdvAcc] = useState("");
  const [isStartCalendarOpen, setStartCalendarOpen] = useState(false);
  const [isFStartCalendarOpen, setFStartCalendarOpen] = useState(false);
  const [isEndCalendarOpen, setEndCalendarOpen] = useState(false);
  const [isFEndCalendarOpen, setFEndCalendarOpen] = useState(false);
  const dispatch = useDispatch();
  const draftCampaign = useSelector((state: RootState) => state.campaign);
  const toast = useToast();
  const [isFocusedOrHasValue, setIsFocusedOrHasValue] = useState(false);
  const [audience, setAudience] = useState<number>(0);
  const [audience1, setAudience1] = useState<string>("");
  const [senderidlist, setSenderidlist] = useState<SenderDetail[]>([]);
  const [senderid, setSenderid] = useState("");
  const workspaceId = useSelector(
    (state: RootState) => state.authentication.workspace_id
  );
  const [selectedTargetCountries, setSelectedTargetCountries] = useState<
    string[]
  >([]);
  const [selectedRoamingCountries, setSelectedRoamingCountries] = useState<
    string[]
  >([]);
  const [updateAudience, setUpdateAudience] = useState("");
  const [ageList, setAgeList] = useState<Age[]>([]);
  const [genderList, setGenderList] = useState<Gender[]>([]);
  const [IncomeLevelList, setIncomeLevelList] = useState<IncomeLevel[]>([]);
  const [locationList, setLocationList] = useState<Location[]>([]);
  const [interestList, setInterestList] = useState<Interest[]>([]);
  const [behaviourList, setBehaviourList] = useState<Behaviour[]>([]);
  const [deviceList, setDeviceList] = useState<Device[]>([]);
  const [osList, setOsList] = useState<OS[]>([]);
  //const [phoneNumberList, setPhoneNumberList] = useState<PhNoList[]>([]);
  const [age, setAge] = useState(0);
  const [gender, setGender] = useState(0);
  const [incomeLevel, setIncomeLevel] = useState(0);
  const [locationcity, setLocationCity] = useState(0);
  const [interest, setInterest] = useState(0);
  const [behaviour, setBehaviour] = useState(0);
  const [device, setDevice] = useState(0);
  const [osDevice, setOsDevice] = useState(0);
  
  const [updateAge, setUpdateAge] = useState("");
  const [updateGender, setUpdateGender] = useState("");
  const [updateIncomeLevel, setUpdateIncomeLevel] = useState("");
  const [updateLocation, setUpdateLocation] = useState("");
  const [updateInterest, setUpdateInterest] = useState("");
  const [updateBehaviour, setUpdateBehaviour] = useState("");
  const [updateDevice, setUpdateDevice] = useState("");
  const [updateOsDevice, setUpdateOsDevice] = useState("");

  const incountry = useSelector((state:RootState) => state.advertiserAccount.incountry);
  const [ageError, setAgeError] = useState<string | null>(null);
  const [genderError, setGenderError] = useState<string | null>(null);
  const [incomeLevelError, setIncomeLevelError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [interestError, setInterestError] = useState<string | null>(null);
  const [behaviourError, setBehaviourError] = useState<string | null>(null);
  const [deviceError, setDeviceError] = useState<string | null>(null);
  const [osDeviceError, setOsDeviceError] = useState<string | null>(null);
  const BillingCountrydata = useSelector( (state: RootState) => state.authentication.workspaceData?.billingCountry );
  const [currency, setCurrency] = useState("");
  const [currencyData, setCurrencyData] = useState<BillingCountry[]>([]);
  const [currencySymbol, setCurrencySymbol] = useState<string>("");
  const [currencyName, setCurrencyName] = useState<string>("");
  const [countryName,setCountyrName] = useState<String>("");
  const [showRussiaAndKazakhstan, setShowRussiaAndKazakhstan] = useState(false);
  const [hasRussiaOrKazakhstanSelected, setHasRussiaOrKazakhstanSelected] = useState(false); 

  const [budgetType, setBudgetType] = useState<string>(""); // default to daily budget
  const [messageFrequency, setMessageFrequency] = useState<string | null>(null); // Default to daily
  const [dailyRecipientLimit, setDailyRecipientLimit] = useState<number | "">("");
  const [dailyLimitError, setDailyLimitError] = useState<string | null>(null);
  const [isDailyLimitTouched, setIsDailyLimitTouched] = useState(false);
  const [isFrequencyOpen, setIsFrequencyOpen] = useState(false);
  const [isReceiveLimitOpen, setIsReceiveLimitOpen] = useState(false);
  const [messageFrequencyError, setMessageFrequencyError] = useState<string | null>(null);
  const [startTimeError, setStartTimeError] = useState<string | null>(null);
  const [endTimeError, setEndTimeError] = useState<string | null>(null);
  const [budgetTypeError, setBudgetTypeError] = useState<string | null>(null);
  const [isAdminApproved, setIsAdminApproved] = useState<boolean | null>(null);
  const [isOperatorApproved, setIsOperatorApproved] = useState<boolean | null>(null);
  const [budgetAndSchedule, setBudgetAndSchedule] = useState<string>("");
  const [sequentialDelivery, setSequentialDelivery] = useState<boolean | null>(null);
  const [preventDuplicateMessages, setPreventDuplicateMessages] = useState<boolean | null>(null);
  const [deliveryStartTime, setDeliveryStartTime] = useState<string>("");
  const [deliveryEndTime, setDeliveryEndTime] = useState<string>("");
  const [tempSelectedCountries, setTempSelectedCountries] = useState<string[]>([]); 
  
  const [walletAmount,setWalletAmount]=useState<string>("");
  const [perMessageCost,setPerMessgeCost] = useState<string>("");
  const [totalRecepientsdFromAud , setTotalRecepientsFromAud] = useState<string>("");
  const [SelectedRecipientsFromAud, setSelectedRecipientsFromAud] = useState<number>(0);
  const [totalRecipientsFromOP, setTotalRecipientsByOP] = useState<number>(0); // total recipients count from operator
  const [SelectedRecipientsFromOP, setSelectedRecipientsByOP] = useState<number>(0);
  const [countryBasedRecipients, setCountryBasedRecipients] = useState<number | null>(null);

  const [SelectedLocation, setSelectedLocation] = useState<string[]>([]);
  const [selectedcampaignBudget, setSelectedCampaignBudget] = useState<number>(0);  //Maha
  const [SelectedRecipientsFromBudget, setSelectedRecipientsFromBudget] = useState<number>(0);
  const [initialSelectedRecipients] = useState(0);
  const [initialTotalRecipients] = useState(0);
  const [SMPP_ID , setSMPP_ID] = useState(0);
  const [SMS_ConnectionID, setSMS_ConnectionID] = useState(0);
  const [SMS_Number,setSMS_Number] = useState("");
  //const [ShortCode,SetShortCode] = useState("");
  //const [selectedShortCode,setSelectedShortCode] = useState("");
 // const [shortCodesList, setShortCodesList] = useState<string[]>([]);
 const [selectedShortCode, setSelectedShortCode] = useState<string | undefined>(undefined);

  const [shortCodesList, setShortCodesList] = useState<ShortCodeEntry[]>([]); 
  const [tableData, setTableData] = useState<WhatsAppBusinessAccount[]>([]);
  const [whatsappNumbers, setWhatsappNumbers] = useState<{ id: string; number: string }[]>([]);
  const [selectedWhatsAppNumber, setSelectedWhatsAppNumber] = useState<string>("");
  const [hasUserSelected, setHasUserSelected] = useState(false); 
  const [campaignType, setCampaignType] = useState<string>("");
  const [isFormValidated, setIsFormValidated] = useState(false);
  const [canSubmit, setCanSubmit] = useState(true); 

  const whatsappUrl = useSelector(
      (state: RootState) => state.authentication.apiURL
    );

    const workspaceName = useSelector(
      (state: RootState) => state.authentication.workspaceName
    );
  const [recipientsData, setRecipientsData] = useState<{
    campaignBudget: number | null;
    workspaceId: number | null;
    location: string | null;
    totalRecipients: number | null;
    userPersonalId: number | null;
    userAccountId: number | null;
    email: string | null;
    productName: string | null;
    perMessage: number | null;
    totalCost: number | null;
    remainingAmount: number | null;
    maxRecipients: number | null;
  }>({
    campaignBudget: null,
    workspaceId: null,
    location: null,
    totalRecipients: null,
    userPersonalId: null,
    userAccountId: null,
    email: null,
    productName: null,
    perMessage: null,
    totalCost: null,
    remainingAmount: null,
    maxRecipients: null,
  });


  const [selectedFromCountryValues, setSelectedFromCountryValues] = useState<string[]>([]);
  const [selectedToCountryValues, setSelectedToCountryValues] = useState<string[]>([]);
  
 
  // const selectedRecipients = 1240;
  // const totalRecipients = 3448;
  // const percentage = Math.round((selectedRecipients / totalRecipients) * 100);
  // const SelectedRecipientsFromAud1 = 56;
  //const totalRecepientsdFromAud1 = 266;

const selectedRecipients = Number(
  audience !== 0 
    ? SelectedRecipientsFromAud ?? 0
    : reachPeopleFrom.length !== 0 
    ? SelectedRecipientsFromOP ?? 0
    : initialSelectedRecipients ?? 0
);

const totalRecipients = Number(
  audience !== 0 ? totalRecepientsdFromAud : totalRecipientsFromOP
);

const percentage =
  totalRecipients > 0 ? Math.round((selectedRecipients / totalRecipients) * 100) : 0;

  const [showDialog, setShowDialog] = useState(false);
  const handleDiscard = () => {
    dispatch(clearDraftedCampaign());
    sessionStorage.removeItem("draftedCampaign");
    dispatch(setCreateBreadCrumb(false));
    navigate("/navbar/campaignlist");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCampaignBudget(value);
    setIsFocusedOrHasValue(value.trim() !== "");
  };

  const handleFocus = () => {
    setHasInteracted(false);
    setIsFocusedOrHasValue(true);
  };

  type FieldName = 'campaignName' | 'campaignBudget' | 'campaignStartDate';

  const handleBlur = (fieldName: FieldName) => {
    setHasInteracted(true);
  
    switch (fieldName) {
      case 'campaignName':
        validateCampaignName(campaignName);
        break;
      // case 'campaignBudget':
      //   validateBudget(campaignBudget);
      //   break;
      // case 'campaignStartDate':
      //   validateStartDate(campaignStartDate);
      //   break;
      default:
        break;
    }
  };
  
  const handleMultiSelectClose = async () => {
    if (isCardLoading) return; 
  
    const hasRussiaOrKazakhstan = tempSelectedCountries.some((id) =>
      ["Russia", "Kazakhstan"].includes(
        targetCountryList.find((c) => c.country_id.toString() === id)
          ?.country_name ?? ""
      )
    );
  
    setShowRussiaAndKazakhstan(hasRussiaOrKazakhstan);
    setReachPeopleFrom(tempSelectedCountries);

    if (!hasRussiaOrKazakhstan) {
      return;
    }
 
    setIsCardLoading(true);
  
    try {
      await Promise.all([
        getAgeList(),
        getGenderList(),
        GetIncomeLevelList(),
        GetLocationList(),
        GetInterestList(),
        GetBehaviourList(),
        GetDeviceList(),
        GetOSDeviceList(),
        
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsCardLoading(false);
    }
  };
  

  const currentDate = new Date();

  const handleStartDateChange = (date: Date | undefined) => {
    if (!date || isNaN(date.getTime())) {
      setStartDateError("Start date is required");
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to midnight
  
    if (date < today) {
      setStartDateError("Start date must be greater than or equal to today.");
    } else {
      setStartDateError(null);
    }
  
    const formattedDate = format(date, "dd/MM/yyyy");
    setCampaignStartDate(format(date, "dd/MM/yyyy"));
    setStartCalendarOpen(false); // Close the calendar after selection
     
  };
  
  const handleEndDateChange = (date: Date | undefined) => {
    if (!date || isNaN(date.getTime())) {
      setEndDateError("End date is required");
      return;
    }
  
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to midnight
  
    if (date < today) {
      setEndDateError("End date must be greater than or equal to today.");
      return;
    }
  
    if (campaignStartDate) {
      const [startDay, startMonth, startYear] = campaignStartDate.split("/").map(Number);
      const startDate = new Date(startYear, startMonth - 1, startDay);
  
      if (startDate > date) {
        setEndDateError("End date must be after the start date.");
        return;
      }
    }
  
    setEndDateError(null);
    setCampaignEndDate(format(date, "dd/MM/yyyy"));
    setEndCalendarOpen(false); // Close the calendar after selection
  };
  
  
  // Handle Frequency Start Date Change
  const handleFrequencyStartDateChange = (date: Date | undefined) => {
    if (date) {
      setFCampaignStartDate(format(date, "dd/MM/yyyy"));
      setFStartCalendarOpen(false); // Close the calendar
    }
  };

  const handleFrequencyEndDateChange = (date: Date | undefined) => {
    if (date) {
      setFCampaignEndDate(format(date, "dd/MM/yyyy"));
      setFEndCalendarOpen(false); // Close the calendar
    }
  };

  const isStartDateDisabled = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0); 
    return date < today; 
  };

  const isEndDateDisabled = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    date.setHours(0, 0, 0, 0); 

    if (campaignStartDate) {
      const startDate = new Date(
        campaignStartDate.split("/").reverse().join("-")
      );
      startDate.setHours(0, 0, 0, 0); 

      return date < today || date < startDate;
    }

    if (FcampaignStartDate) {
      const startDate = new Date(
        FcampaignStartDate.split("/").reverse().join("-")
      );
      startDate.setHours(0, 0, 0, 0); 

      return date < today || date < startDate;
    }
    return date < today;
  };

  const formatingDate = (dateString: string) => {
    
    const [day, month, year] = dateString.split("/").map(Number);
    const dateUTC = new Date(Date.UTC(year, month - 1, day));
    return dateUTC.toISOString();
    
  };

  const formatDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); 
    const year = date.getFullYear(); 

    return `${day}/${month}/${year}`; 
  };

 const apiUrlAdminAcc = useSelector(
    (state: RootState) => state.authentication.adminUrl
  );

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch("/config.json");
        const config = await response.json();
        console.log("Config loaded:", config); // Debugging log
        setApiUrlAdvAcc(config.ApiUrlAdvAcc); // Set API URL from config
      } catch (error) {
        console.error("Error loading config:", error);
        toast.toast({
          title: "Error",
          description: "Something went wrong, Please try again later"
        });
      }
      finally{

      }
    };

    fetchConfig();
  }, []); // Runs only once on mount

  // Watch for apiUrlAdvAcc and campaignId to change and fetch data
  useEffect(() => {
    if(apiUrlAdvAcc){
      const fetchData = async () => {
        console.log(
          "Fetching data for apiUrlAdvAcc:",
          apiUrlAdvAcc,
          "campaignId:",
          campaignId
        ); // Debugging log
    
        try {
          await Promise.all([
            GetCurrencyById(),
            getChannelList(),
           // getCheckedChannelsList(),
       //     getAdvertiserShortCodeMapper(),
            getCountryList(),
            getTemplateList(),
            getAudienceList(),
            getTargetCountryList(),
            getRoamingCountryList(),
            getWalletAmount(),
            GetSMSPhoneNUmbers(),
          //  GetWhatsappPhoneNumbers(),
            //campaignId ? loadCampaignList(campaignId) : Promise.resolve(),
            campaignId ? getAdminComment(campaignId) : Promise.resolve(),
          ]);
          console.log("CmapaignID Check?" ,campaignId );
          console.log("Data fetched successfully!..");
          setLoading(false); // Set loading to false only when all APIs succeed
        } catch (error) {
          console.error("Error fetching data:", error);
          toast.toast({
            title: "Error",
            description: "Something went wrong, Please try again later",
          });
        }
      };
      fetchData();
    }else{
      console.log("Api Url not available yet")
    }
 
  }, [apiUrlAdvAcc]);

  useEffect(() => {
    if (campaignId && channelList.length > 0 && audienceList.length > 0) {
      loadCampaignList(campaignId);
    }
    console.log("channelList:" , channelList);
  }, [campaignId, channelList , audienceList]);

  useEffect(() => {
    const selectedChannel = channelList
      .find((ch) => ch.channelId.toString() === channel?.toString())
      ?.channelName.toLowerCase();

    if (selectedChannel === "sms" && shortCodesList.length > 0) {
      // setSelectedShortCode(shortCodesList[0]);
      setSelectedShortCode("");
      setHasUserSelected(false);
    } else {
      setSelectedShortCode(""); // Keep it empty for placeholder
    }
  }, [channel, shortCodesList]);
  useEffect(() => {
    const selectedChannel = channelList.find(
      (c) => c.channelId.toString() === channel.toString()
    );
    if (
      selectedChannel &&
      selectedChannel.channelName.toLowerCase() === "sms"
    ) {
     // debugger;
      // Call the API to fetch sender IDs
      axios
        .get(`${apiUrlAdvAcc}/getsmssenderlist`, {
          params: { workspaceid: workspaceId, channelid: channel },
        })
        .then((response) => {
          if (response.data.status === "Success") {
            let data = response.data.senderDetails;
            // Wrap in an array if a single object is returned
            if (!Array.isArray(data)) {
              data = [data];
            }
            setSenderidlist(data);
            // Optionally set a default value if available
            if (data.length > 0) {
              setSenderid(data[0].sender_id); // set default to first sender_id
            }
            console.log("Sender list:", data);
          }
        })
        .catch((error) => {
          console.error("Error fetching sender list", error);
        });
    }
  }, [channel, channelList, apiUrlAdvAcc, workspaceId]);
  
  const handleCampaignNameChange = (value: string) => {
    setCampaignName(value);
    validateCampaignName(value);
   dispatch(setDraftedCampaign({ campaignName: value }));  
  };
 
 
  const handleChannelChange = (value: string) => {
    setChannel(value);
    setTemplate("");
    validateChannel(value);
  };

  const handleSenderIDChange = (value: string) => {
    validateSenderID(value);        
    setHasUserSelected(true);
    dispatch(setDraftedCampaign({ selectedShortCode: value }));
    const selectedWhatsApp = whatsappNumbers.find((w) => w.id === value);
    if (selectedWhatsApp) {
      setSelectedShortCode(selectedWhatsApp.id); 
    } else {
      setSelectedShortCode(value); 
    
    const selectedSMS = shortCodesList.find((item) => item.smsNumber === value);
    if (selectedSMS) {
      setSMPP_ID(selectedSMS.smppId);
      setSMS_ConnectionID(selectedSMS.smsConnectionId);
      setSMS_Number(selectedSMS.smsNumber);
    }
  }
      setPhoneNumberError(null);
  };
  const handleTemplateChange = (value: string) => {
    setTemplate(value);
    validateTemplate(value);
   dispatch(setDraftedCampaign({ template: value }));
    console.log("temp:", template); // Pass the updated value for validation
  };
  
  const handleReachPeopleFromChange = async (values: string[]) => {
    setReachPeopleFrom(values);
    validateFromCountry(values);
    setTempSelectedCountries(values);
    console.log("Country Value:", values);
    dispatch(setDraftedCampaign({ selectedFromCountry: values }));

    if (values.length > 0) {
      setAudience(0);
    } else if (reachPeopleIn.length === 0) {
      setAudience(0);
    }
  
    const selectedCountryNames = values
      .map((id) => 
        targetCountryList.find((c) => c.country_id.toString() === id)?.country_name ?? ""
      )
      .filter(Boolean);
  
    setSelectedLocation(selectedCountryNames);
    console.log("Formatted Country Names:", selectedCountryNames.join(", "));
  
    const hasRussiaOrKazakhstan = selectedCountryNames.some((name) =>
      ["Russia", "Kazakhstan"].includes(name)
    );
    setHasRussiaOrKazakhstanSelected(hasRussiaOrKazakhstan);
    if (!hasRussiaOrKazakhstan) {
      setShowRussiaAndKazakhstan(false);
    }
  
    try {
      await Promise.all([
        getTotalRecipientsFromCountry(selectedCountryNames.join(",")), 
        // Use selectedCountryNames directly
      ]);
      console.log("success");
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  
  const handleReachPeopleInChange = async (values: string[]) => {
    setReachPeopleIn(values);
    console.log("RechPeopleIn:" , values);
    console.log("RechPeopleIn"  , JSON.stringify(values));
    validateInCountry(values);
    dispatch(setDraftedCampaign({ selectedToCountry: values }));

    if (values.length > 0) {
      setAudience(0); 
    } else if (reachPeopleFrom.length === 0) {
      setAudience(0); 
    }


    const selectedCountryNames = reachPeopleFrom
    .map((id) => 
      targetCountryList.find((c) => c.country_id.toString() === id)?.country_name ?? ""
    )
    .filter(Boolean);

    const selectedToCountryNames = values
    .map((id) => 
      roamingCountryList.find((c) => c.country_id.toString() === id)?.country_name ?? ""
    )
    .filter(Boolean);


    try {
      await Promise.all([
        getTotalRecipientsToCountry(selectedCountryNames.join(","),selectedToCountryNames.join(",")), 
        // Use selectedCountryNames directly
      ]);
      console.log("success");
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const displayAudience = updateAudience || (audienceList.length === 0 ? "Select Audience" : "Audience");
  const handleAudienceChange = async (value: string) => {
    if (value === "none") {
      setAudience(0); 
      setAudienceError(null);
      setTotalRecepientsFromAud("0");
      try {
        await getAudienceRecipient(0, selectedcampaignBudget); // Pass zero recipients
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    } else {
      setReachPeopleFrom([]);
      setReachPeopleIn([]);
      const selectedAudienceId = parseInt(value);
      setAudience(parseInt(value)); 

      const selectedAudience = audienceList.find(
        (aud) => aud.list_id === selectedAudienceId
      );

      const totalPeople = selectedAudience?.total_people?.toString() || "0";
      setTotalRecepientsFromAud(totalPeople);
  
    validateAudience(parseInt(value));
    dispatch(setDraftedCampaign({ audience: value }));
  
  try {
    await Promise.all([
      getAudienceRecipient(parseInt(totalPeople),selectedcampaignBudget),]);
  
  } catch (error) {
    console.error("Error fetching data:", error);
  }
  } 
  };

  const handleAgeChange = (value: string) => {
    setAge(parseInt(value));
    validateAge(parseInt(value)); // Pass the updated value for validation
  };

  const handleGenderChange = (value: string) => {
    setGender(parseInt(value));
    validateGender(parseInt(value)); // Pass the updated value for validation
  };

  const handleIncomeLevelChange = (value: string) => {
    setIncomeLevel(parseInt(value));
    validateIncomeLevel(parseInt(value)); // Pass the updated value for validation
  };

  const handleLocationChange = (value: string) => {
    setLocationCity(parseInt(value));
    validateLocation(parseInt(value)); // Pass the updated value for validation
  };

  const handleInterestChange = (value: string) => {
    setInterest(parseInt(value));
    console.log("InterestI:", interest);
    validateInterest(parseInt(value)); // Pass the updated
  };

  const handleBehaviourChange = (value: string) => {
    setBehaviour(parseInt(value));
    console.log("BehaviourI:", behaviour);
    validateBehaviour(parseInt(value)); // Pass the updated value for validation
  };

  const handleDeviceChange = (value: string) => {
    setDevice(parseInt(value));
    validateDevice(parseInt(value)); // Pass the updated value for validation
  };

  const handleOsDeviceChange = (value: string) => {
    setOsDevice(parseInt(value));
    validateOsDevice(parseInt(value)); // Pass the updated
  };

  const handleCampaignBudgetChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const updatedBudget = e.target.value;
    setCampaignBudget(updatedBudget);
    validateBudget(updatedBudget);
    dispatch(setDraftedCampaign({ campaignBudget: updatedBudget }));

    const parsedBudget = Number(updatedBudget);
    //const budgetToSend = isNaN(parsedBudget) ? 0 : parsedBudget;
    const budgetToSend = updatedBudget.trim() === '' ? '0' : updatedBudget;

    //if (budgetError) validateBudget();
    try {
      await Promise.all([
      audience !== 0
            ? getAudienceRecipient(parseInt(totalRecepientsdFromAud),parseFloat(budgetToSend))
            : reachPeopleFrom.length !== 0
            ? getTotalRecipientsByBudget(budgetToSend)
            : getMaxRecipientsByBudget(Number(budgetToSend), Number(workspaceId)),
      ]);
    } catch (error) {
      console.error("Error fetching recipients data:", error);
    }
  };

  const handleBudgetTypeChange = (value: string) => {
    setBudgetType(value);
    ValidateBudgetType(value);
    dispatch(setDraftedCampaign({ budgetType: value }));  
    // Revalidate budget when budget type changes (if there's a budget entered)
    if (campaignBudget) {
      validateBudget(campaignBudget);
    }
  };
  
  const validateDailyLimit = (): boolean => {

     if (typeof dailyRecipientLimit === 'string' && dailyRecipientLimit.trim() === '') {
    setDailyLimitError('Daily Recipient limit is required');
    return false;
  }
  const numericValue = Number(dailyRecipientLimit);
  if (isNaN(numericValue) || numericValue < 1 || numericValue > 100) {
    setDailyLimitError('Please enter a valid percentage between 1 and 100');
    return false;
  }  
    setDailyLimitError(null);
    return true;
  };
  

  const validateMessageFrequency = (value: string | null): boolean => {
    console.log("validateMessageFrequency:" , value);
    if (!value) {
      setMessageFrequencyError("Message frequency is required.");
      return false;
    }
    setMessageFrequencyError("");
    return true;
  };

  
  const ValidateBudgetType = (value: string | null): boolean => {
    
    if (!value) {
      setBudgetTypeError("Budget Type is required.");
      return false;
    }
    setBudgetTypeError("");
    return true;
  };

  

  const validateStartTime = (value: string | null) => {
    if (!value) {
      setStartTimeError("Start time is required.");
      return false;
    }
    setStartTimeError(null);
    return true;
  };
  
  const validateEndTime = (value: string | null) => {
    if (!value) {
      setEndTimeError("End time is required.");
      return false;
    }
  
    if (deliveryStartTime && value <= deliveryStartTime) {
      setEndTimeError("End time must be later than start time.");
      return false;
    }
    setEndTimeError(null);
    return true;
  };
  
  const handleFCampaignBudgetChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFCampaignBudget(e.target.value);
    validateFBudget();
  };

  const handleDailyLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    if (!isDailyLimitTouched) {
      setIsDailyLimitTouched(true); // Mark as touched on first interaction
    }
    const inputValue = e.target.value;
  
    if (inputValue === "") {
      setDailyRecipientLimit("");
      setDailyLimitError("Please enter a valid percentage between 1 and 100");
    } else {
      const numericValue = Number(inputValue);
      if (!isNaN(numericValue) && numericValue >= 1 && numericValue <= 100) {
        setDailyRecipientLimit(numericValue);
        dispatch(setDraftedCampaign({ dailyRecipientLimit: numericValue.toString() }));
        setDailyLimitError(null); // Remove error on valid input
      } else {
        setDailyLimitError("Please enter a valid percentage between 1 and 100"); // Show error on invalid input
      }
    }
  };
    
  useEffect(() => {
    console.log("campaignNames: : --> ", campaignNames); 
  }, [campaignNames]);

  const [hasInteracted, setHasInteracted] = useState(false);
  
  const validateCampaignName = (name: string): boolean => {
   
    const trimmedName = name.trim();
    console.log("trimmedName:",trimmedName);
    if (!trimmedName) {
      setCampaignNameError("Campaign name is required");
      return false;
    }
  
    console.log("campaignNames:", campaignNames, "Entered Campaign Name:", name.trim());
  
    if (campaignNames.some((existingName: string) => existingName.trim().toLowerCase() === trimmedName.toLowerCase())) {        
    setCampaignNameError("The campaign name already exists. Please choose a different name.");
      return false;
    }

    const minLength = 3;
  const maxLength = 30;

  if (trimmedName.length < minLength) {
    setCampaignNameError(`Campaign name must be at least ${minLength} characters long.`);
    return false;
  }

  if (trimmedName.length > maxLength) {
    setCampaignNameError(`Campaign name must not exceed ${maxLength} characters.`);
    return false;
  }

    const specialCharAtEdgesPattern = /^[^a-zA-Z0-9].*|.*[^a-zA-Z0-9]$/;

    if (specialCharAtEdgesPattern.test(trimmedName)) {
      setCampaignNameError("Campaign name should not start or end with a special character.");
      return false;
    }
    
    setCampaignNameError(null);
    return true;
  };
  
  const validateChannel = (value: string): boolean => {
  console.log("validateChannel" , value);
    if (!value) {
      setChannelError("Please select a channel");
      return false;
    }
    setChannelError(null);
    return true;
  };

  const validateSenderID = (value: string): boolean => {
    console.log("validateSenderID" , value);
      if (!value) {
        setPhoneNumberError("Please select a sender id");
        return false;
      }
      setPhoneNumberError(null);
      return true;
    };

  const validateTemplate = (value: string): boolean => {
    console.log("Temp Value:" , value)
    if (!value) {
      setTemplateError("Please select a template");
      return false;
    }
    setTemplateError(null);
    return true;
  };

  
  const validatePhoneNumber = (value: string): boolean => {
    console.log("Hi", value);
    
    if (!channelList || channelList.length === 0) {
      console.error("channelList is empty or undefined");
      return false;
    }
  
    const selectedChannelObj = channelList.find(
      (c) => c.channelId.toString() === channel?.toString()
    );
  
    if (!selectedChannelObj) {
      console.error("No matching channel found for channel ID:", channel);
      return false;
    }
  
    const selectedChannel = selectedChannelObj.channelName.toLowerCase();
    console.log("selectedChannel:", selectedChannel);
  
    if (selectedChannel === "sms" && !value) {
      setPhoneNumberError("Please select a phone number");
      return false;
    }
  
    setPhoneNumberError(null);
    return true;
  };
  


  const validateAudience = (value: number): boolean => {
    console.log("Audience Value:" , value)

    if (isAudienceDisabled) {
      setAudienceError(null);
      return true;
    }
    if (!value) {
      setAudienceError("Please select a Audience");
      return false;
    }
    setAudienceError(null);
    return true;
  };

const isReachPeopleFromDisabled = audience !== 0 && audience !== null;
const isReachPeopleInDisabled = audience !== 0 && audience !== null;
const isAudienceDisabled = reachPeopleFrom.length > 0 || reachPeopleIn.length > 0;


  const validateFromCountry = (values: string[]): boolean => {
    
    const isDisabled = audience !== 0 && audience !== null;

  if (isDisabled) {
    setTargetCountryError(null); // Clear error if field is disabled
    return true;
  }
    if (values.length === 0) {
      setTargetCountryError("Please select a country");
      return false;
    }
  
    setTargetCountryError(null);
    return true;
  };
  
  const validateInCountry = (values: string[]): boolean => {
    
    const isDisabled = audience !== 0 && audience !== null;

    if (isDisabled) {
      setRoamingCountryError(null); // Clear error if field is disabled
      return true;
    }

    if (values.length === 0) {
      setRoamingCountryError("Please select a country");
      return false;
    }
  
    setRoamingCountryError(null);
    return true;
  };
  
  const validateBudget = (value: string): boolean => {

    if (typeof value === "string") {
      value = value.trim(); 
    }

    const parsedBudget = parseFloat(value);
    const wallet = parseFloat(walletAmount);
    const messageCost = parseFloat(perMessageCost); 

    if (!value.trim() || isNaN(parsedBudget) || parsedBudget <= 0) {
      setBudgetError("Please enter a valid campaign budget");
      return false;
    } 

    if (!/^\d{1,10}(\.\d{1,2})?$/.test(parsedBudget.toString())) {
      setBudgetError("Budget should have at most 10 digits before the decimal and 2 decimal places.");
      return false;
    }

    // if (parsedBudget > wallet) {
    //   setBudgetError("You do not have enough balance in your wallet.");
    //   return false;
    // }

    if (parsedBudget < messageCost) {
    setBudgetError(
      `Your budget is too low compared to the per message cost (${messageCost}).`
    );
    return false;
  }
    setBudgetError(null);
    return true;
  };

  const validateFBudget = (): boolean => {
    const parsedBudget = parseFloat(campaignBudget);
    if (!campaignBudget || isNaN(parsedBudget) || parsedBudget <= 0) {
      setFBudgetError("Please enter a valid campaign budget");
      return false;
    }
    setFBudgetError(null);
    return true;
  };

  const validateAge = (value: number): boolean => {
    if (!value) {
      setAgeError("Please select a Age");
      return false;
    }
    setAgeError(null);
    return true;
  };

  const validateGender = (value: number): boolean => {
    if (!value) {
      setGenderError("Please select a Gender");
      return false;
    }
    setGenderError(null);
    return true;
  };

  const validateIncomeLevel = (value: number): boolean => {
    if (!value) {
      setIncomeLevelError("Please select a Income Level");
      return false;
    }
    setIncomeLevelError(null);
    return true;
  };

  const validateLocation = (value: number): boolean => {
    if (!value) {
      setLocationError("Please select a Location");
      return false;
    }
    setIncomeLevelError(null);
    return true;
  };

  const validateInterest = (value: number): boolean => {
    if (!value) {
      setInterestError("Please select a Interest");
      return false;
    }
    setInterestError(null);
    return true;
  };

  const validateBehaviour = (value: number): boolean => {
    if (!value) {
      setBehaviourError("Please select a Behaviour");
      return false;
    }
    setBehaviourError(null);
    return true;
  };

  const validateDevice = (value: number): boolean => {
    if (!value) {
      setDeviceError("Please select a Device");
      return false;
    }
    setDeviceError(null);
    return true;
  };

  const validateOsDevice = (value: number): boolean => {
    if (!value) {
      setOsDeviceError("Please select a OS Device");
      return false;
    }
    setOsDeviceError(null);
    return true;
  };

  const validateStartDate = (value: string): boolean => {
    let isValid = true;
    if (!value) {
      setStartDateError("Start date is required");
      isValid = false;
    } else {
      setStartDateError(null);
    }
    return isValid;
  }

  const validateEndDate = (value: string): boolean => {
    let isValid = true;
    if (!value) {
      setEndDateError("End date is required");
      isValid = false;
     
    } else if (new Date(campaignEndDate) < new Date(campaignStartDate)) {
      setEndDateError("End date cannot be earlier than start date");
      isValid = false;
     
    } else {
      setEndDateError(null);
    }
    return isValid;
  }

  const validateDates = (value: string): boolean => {
    let isValid = true;
    //debugger;
    if (!value) {
      setStartDateError("Start date is required");
      isValid = false;
    } else {
      setStartDateError(null);
    }

    if (!value) {
      setEndDateError("End date is required");
      isValid = false;
    } else if (new Date(campaignEndDate) < new Date(campaignStartDate)) {
      setEndDateError("End date cannot be earlier than start date");
      isValid = false;
    } else {
      setEndDateError(null);
    }
    return isValid;
  };

  const resetForm = () => {
    setCampaignName("");
    setCampaignBudget("");
    setTemplate("");
    setReachPeopleFrom([]);
    setReachPeopleIn([]);
    setChannel("");
    setCampaignStartDate("");
    setCampaignEndDate("");
    setFCampaignStartDate("");
    setFCampaignEndDate("");
    setAge(0);
    setGender(0);
    setIncomeLevel(0);
    setLocationCity(0);
    setInterest(0);
    setBehaviour(0);
    setDevice(0);
    setOsDevice(0);
    setAudience(0);
  };

  const getCountryList = async () => {
    setLoading(true);

    try {
      const response = await axios.get(`${apiUrlAdvAcc}/GetCountryList`);

      // Assuming the response data contains a 'CountryList' field as discussed earlier
      if (response.data && response.data.countryList) {
        setCountryList(response.data.countryList);
        console.log("Country List : ", response.data.countryList);
      } else {
        console.log("No country list available in response.");
      }
    } catch (error) {
      // Handle error if API call fails

      console.error("Error fetching country list:", error);
    } finally {
    }
  };

  const getTargetCountryList = async () => {
    setLoading(true);

    try {
      const response = await axios.get(
        `${apiUrlAdvAcc}/GetReachPeopleFromList`
      );

      // Assuming the response data contains a 'CountryList' field as discussed earlier
      if (response.data && response.data.reachPeopleFromList) {
        setTargetCountryList(response.data.reachPeopleFromList);
        console.log("TargetCountry List : ", response.data.reachPeopleFromList);
      } else {
        console.log("No targetCountryList available in response.");
      }
    } catch (error) {
      // Handle error if API call fails

      console.error("Error fetching targetCountryList:", error);
    } finally {
    }
  };

  const getRoamingCountryList = async () => {
    setLoading(true);

    try {
      const response = await axios.get(`${apiUrlAdvAcc}/GetReachPeopleToList`);

      // Assuming the response data contains a 'CountryList' field as discussed earlier
      if (response.data && response.data.reachPeopleToList) {
        setRoamingCountryList(response.data.reachPeopleToList);
        console.log("RoamingCountry List : ", response.data.reachPeopleToList);
      } else {
        console.log("No RoamingCountry List available in response.");
      }
    } catch (error) {
      // Handle error if API call fails

      console.error("Error fetching RoamingCountry List:", error);
    } finally {
    }
  };

  const GetCurrencyById = async () => {
    setLoading(true);

    try {
      console.log("workspaceeid:", workspaceId);
      // const response = await axios.get(`${apiUrlAdvAcc}/GetCurrencyById/${workspaceId}`);
      const response = await axios.get(`${apiUrlAdvAcc}/GetCurrencyById`, {
        params: { workspaceId },
      });
      if (response.data && response.data.currencyList) {
        setCurrencyData(response.data.currencyList);
        setCurrencySymbol(response.data.currencyList[0].symbol);
        setCurrencyName(response.data.currencyList[0].currency_name);
        setCountyrName(response.data.currencyList[0].country_name);
        console.log(" Currencyy : ", response.data.currencyList);
        console.log("currencySymbol:" , response.data.currencyList[0].symbol);
        console.log("currency_name:" , response.data.currencyList[0].currency_name);
      } else {
        console.log("No currencyy available in response.", response.data);
      }
    
    } catch (error) {
      console.error("Error fetching in currency data: " + error);
    }
    finally {
    }
  };


  const getAudienceList = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${apiUrlAdvAcc}/GetAdvAudienceListDetailsByWorkspaceId?workspace_id=${workspaceId}`
      );
      if (response.data.status === "Success") {
        setAudienceList(response.data.audienceList);
      //  setTotalRecepientsFromAud(response.data.audienceList[0].total_people);
        console.log("audience list: ", response.data.audienceList);
        console.log("audience Total Recepients: ", response.data.audienceList[0].total_people);
      } else {
        console.error("No audience list found for workspace");
      }
    } catch (error) {
      console.error("Error calling audience list api: " + error);
    }
    finally {
    }
  };

  const getTemplateList = async () => {
    setLoading(true);

    try {
      const response = await axios.get(
        `${apiUrlAdvAcc}/GetMetaTemplateDetails?workspace_id=${workspaceId}`
      );

      if (response.data && response.data.templateDetails) {
        setTemplateList(response.data.templateDetails);
        console.log(response.data.templateDetails);
      } else {
        console.log("No template list available in response.");
      }
    } catch (error) {
      // Handle error if API call fails

      console.error("Error fetching template list:", error);
    } finally {
    }
  };

  const getChannelList = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiUrlAdvAcc}/GetChannelList`);

      if (response.data && response.data.channelList) {
        const correctedList = response.data.channelList.map((ch: any) => ({
          channelId: ch.channel_id,
          channelName: ch.channel_name,
        }));
        setChannelList(correctedList);
        console.log("Channel List : ",correctedList);
      } else { 
        console.log("No channel list available in response.");
      }
    } catch (error) {
      console.error("Error fetching channel list:", error);
    } finally {
    }
  };

  // const getCheckedChannelsList = async () => {
  //   try {
  //     setLoading(true);
  //     console.log("Fetching Checked Channels...");

  //     const response = await axios.get(
  //       `${apiUrlAdminAcc}/GetAdvertiserChannels?workspaceId=${workspaceId}`
  //     );

  //     if (
  //       response.data.status === "Success" &&
  //       Array.isArray(response.data.channels)
  //     ) {
  //       console.log("Checked Channels Response:", response.data.channels);
  //       setChannelList(response.data.channels);
  //     } else {
  //       console.log("Error fetching checked channels:", response);
  //       setChannelList([]); //  Prevent undefined errors
  //     }
  //   } catch (error) {
  //     console.error("Error fetching checked channels:", error);
  //     setChannelList([]);
  //   }
  // };
	  
  const getAdvertiserShortCodeMapper = async (prefillShortCode?: string) => {
   // setLoading(true);
    try {
      const response = await axios.get(`${apiUrlAdvAcc}/GetAdvertiserShortCodeMapper`, {
        params: { workspaceId },
      });

      if (response.data && response.data.shortCodes) {
        const parsedShortCodes = JSON.parse(response.data.shortCodes); 

        const extractedShortCodes = parsedShortCodes.map((shortCodeEntry: string, index: number) => {
          const values = shortCodeEntry.split("|");

          if (values.length === 3) {
            console.log(`Entry ${index + 1}:`);
            console.log("SMPP_ID:", values[0]);
            console.log("SMS_Conn:", values[1]);
            console.log("ShortCode:", values[2]);

            return {
              smppId: Number(values[0]),
              smsConnectionId: Number(values[1]),
              smsNumber: values[2],
            };
          }
          return null;
        }).filter(Boolean) as ShortCodeEntry[];

        setShortCodesList(extractedShortCodes);

        if (extractedShortCodes.length > 0) {
          // const first = extractedShortCodes[0];
          // setSelectedShortCode(first.smsNumber);
          // setSMPP_ID(first.smppId);
          // setSMS_ConnectionID(first.smsConnectionId);
          // setSMS_Number(first.smsNumber);
          const matched = prefillShortCode
          ? extractedShortCodes.find((s) => s.smsNumber === prefillShortCode)
          : extractedShortCodes[0];

        if (matched) {
          setSelectedShortCode(matched.smsNumber);
         // setSelectedShortCode(undefined);
          setSMPP_ID(matched.smppId);
          setSMS_ConnectionID(matched.smsConnectionId);
          setSMS_Number(matched.smsNumber);
        }
      
        }
      } else {
        console.log("No shortCodes available in response.");
      }
    } catch (error) {
      console.error("Error fetching shortCodes:", error);
    } finally {
     // setLoading(false);
    }
};

  const getWalletAmount = async () => {
    setLoading(true);

    try {
      const response = await axios.get( `${apiUrlAdvAcc}/GetWalletAmount?workspaceId=` + workspaceId );
      if (response.data && response.data.walletAmount) {
        setWalletAmount(response.data.walletAmount);
        setPerMessgeCost(response.data.perMessageCost);
        console.log("wallet Amount  : ", response.data.walletAmount);
      
        if (parseFloat(response.data.walletAmount) === 0) {
         // setBudgetError("Your wallet is empty. Please top up to continue.");
        }
      } else {
        setWalletAmount("0");
       // setBudgetError("Your wallet is empty. Please top up to continue.");
        console.log("Wallet fetch failed:", response.data.status_Description || "Unknown error");
      }
    }  catch (error) {
        
      console.error("Error fetching in get wallet amount:", error);
    } finally {
    }
  };

  const getTotalRecipientsFromCountry = async (countryName: string) => {
    try {
      const response = await axios.get(
        `${apiUrlAdvAcc}/GetTotalRecipientsFromCountry/${countryName}`
      );
  
      if (response.data && response.data.status === "Success") {
        setSelectedRecipientsByOP(response.data.totalRecipients);
        setTotalRecipientsByOP(response.data.totalRecipients);
        setCountryBasedRecipients(response.data.totalRecipients); 
        console.log("Total Recipients for", countryName, ":", response.data.totalRecipients);
      } else {
        console.log("No recipients available for", countryName);
      }
    } catch (error) {
      console.error("Error fetching total recipients:", error);
    }
  };

  const getTotalRecipientsToCountry = async (countryName: string,toCountryName: string) => {
    try {
      const response = await axios.get(
        `${apiUrlAdvAcc}/GetTotalRecipientsToCountry/${countryName}/${toCountryName}`
      );
  
      if (response.data && response.data.status === "Success") {
        setSelectedRecipientsByOP(response.data.totalRecipients);
        setTotalRecipientsByOP(response.data.totalRecipients);
        setCountryBasedRecipients(response.data.totalRecipients); 
        console.log("Total Recipients for", countryName, ":", response.data.totalRecipients);
      } else {
        console.log("No recipients available for", countryName);
      }
    } catch (error) {
      console.error("Error fetching total recipients:", error);
    }
  };

  const getTotalRecipientsByBudget = async (campaignBudgetValue: string) => {
    try {
      const response = await axios.get(
        `${apiUrlAdvAcc}/GetTotalRecipientsByBudget/get-recipients`,
        {
          params: {
            campaignBudget: campaignBudgetValue,
            workspaceId,
            location: SelectedLocation.join(","),
          },
        }
      );
  
      if (response.data && response.data.status === "Success") {
        setRecipientsData((prevData) => ({
          ...prevData, 
          totalRecipients: response.data.totalRecipients,
          maxRecipients: response.data.maxRecipients,
          totalCost: response.data.totalCost,
          remainingAmount: response.data.remainingAmount,
        }));
        if(Number(campaignBudgetValue)== 0){
        setSelectedRecipientsByOP(countryBasedRecipients || 0);
        }
        else{
          setSelectedRecipientsByOP(response.data.maxRecipients);
        }
        console.log("Total Recipients Data:", Number(campaignBudgetValue));
      } else {
        console.log("No recipients data available.");
      }
    } catch (error) {
      console.error("Error fetching total recipients:", error);
    }
  };
  
  const getAudienceRecipient = async (audienceTotalRecepients: number, campaignBudget: number) => {
    try {
      const response = await axios.get(
        `${apiUrlAdvAcc}/GetRecipientsByCampaignBudget`,
        {
          params: {
            campaignBudget,
            workspaceId,
            totalRecipients : audienceTotalRecepients,
          },
        }
      );
  
      if (response.data && response.data.status === "Success") {
        const { totalRecipients, maxRecipients } = response.data.data || {}; // Ensure response structure
  
        setRecipientsData((prevData) => ({
          ...prevData,
          ...response.data.data,
        }));

        if (campaignBudget === 0) {
          // When selecting audience
          setSelectedRecipientsFromAud(totalRecipients || 0);
          } else {
          // When select campaign budget
          setSelectedRecipientsFromAud(maxRecipients || 0);
          }
      } else {
        console.log("No audience recipients data available.");
      }
    } catch (error) {
      console.error("Error fetching audience recipients:", error);
    }
  };
  

  const getMaxRecipientsByBudget = async (audienceTotalRecepients: number, campaignBudget: number) => {
    try {
      const response = await axios.get(
        `${apiUrlAdvAcc}/GetMaxRecipientsByBudget`,
        {
          params: {
            campaignBudget,
            workspaceId,
          },
        }
      );
  
      if (response.data && response.data.status === "Success") {
        const { maxRecipients = 0 } = response.data.data;

        // Update states correctly
        setSelectedRecipientsFromBudget(maxRecipients);
        //setTotalRecepientsFromAud(maxRecipients || 0); // Ensure maxRecipients updates as well
  
        console.log("Audience Recipients Data:", response.data.maxRecipients);
      } else {
        console.log("No audience recipients data available.");
      }
    } catch (error) {
      console.error("Error fetching audience recipients:", error);
    }
  };
  

  
  const getAgeList = async () => {
  //  setLoading(true);

    try {
      const response = await axios.get(`${apiUrlAdvAcc}/GetAgeList`);

      if (response.data && response.data.ageList) {
        setAgeList(response.data.ageList);
        console.log("Age List : ", response.data.ageList);
      } else {
        console.log("No Age list available in response.");
      }
    } catch (error) {
      // Handle error if API call fails

      console.error("Error fetching Age list:", error);
    } 
  };

  const getGenderList = async () => {
    
    try {
      const response = await axios.get(`${apiUrlAdvAcc}/GetGenderList`);

      if (response.data && response.data.genderList) {
        setGenderList(response.data.genderList);
        console.log("Gender List : ", response.data.genderList);
      } else {
        console.log("No Gender available in response.");
      }
    } catch (error) {
      // Handle error if API call fails

      console.error("Error fetching Gender list:", error);
    }
  };

  const GetIncomeLevelList = async () => {
    
    try {
      const response = await axios.get(`${apiUrlAdvAcc}/GetIncomeLevelList`);

      if (response.data && response.data.incomeLevelList) {
        setIncomeLevelList(response.data.incomeLevelList);
        console.log("Income Level List : ", response.data.incomeLevelList);
      } else {
        console.log("No Income Level List available in response.");
      }
    } catch (error) {
      // Handle error if API call fails

      console.error("Error fetching Income Level list:", error);
    } 
  };

  const GetLocationList = async () => {
    
    try {
      const response = await axios.get(`${apiUrlAdvAcc}/GetLocationList`);

      if (response.data && response.data.locationList) {
        setLocationList(response.data.locationList);
        console.log("Income Level List : ", response.data.locationList);
      } else {
        console.log("No location List List available in response.");
      }
    } catch (error) {
      // Handle error if API call fails

      console.error("Error fetching location list:", error);
    } 
  };

  const GetInterestList = async () => {
   
    try {
      const response = await axios.get(`${apiUrlAdvAcc}/GetInterestList`);

      if (response.data && response.data.interestList) {
        setInterestList(response.data.interestList);
        console.log("Interest List : ", response.data.interestList);
      } else {
        console.log("No Interest List available in response.");
      }
    } catch (error) {
      // Handle error if API call fails

      console.error("Error fetching Interest list:", error);
    } 
  };

  const GetBehaviourList = async () => {
    
    try {
      const response = await axios.get(`${apiUrlAdvAcc}/GetBehaviourList`);

      if (response.data && response.data.behaviourList) {
        setBehaviourList(response.data.behaviourList);
        console.log("Behaviour List : ", response.data.behaviourList);
      } else {
        console.log("No Behaviour List available in response.");
      }
    } catch (error) {      
      console.error("Error fetching Behaviour list:", error);
    } 
  };

  const GetDeviceList = async () => {
    
    try {
      const response = await axios.get(`${apiUrlAdvAcc}/GetDeviceList`);

      if (response.data && response.data.deviceList) {
        setDeviceList(response.data.deviceList);
        console.log("Device List : ", response.data.deviceList);
      } else {
        console.log("No Device List available in response.");
      }
    } catch (error) {
      // Handle error if API call fails

      console.error("Error fetching Device list:", error);
    } 
  };

  const GetOSDeviceList = async () => {
    
    try {
      const response = await axios.get(`${apiUrlAdvAcc}/GetOSDeviceList`);

      if (response.data && response.data.osDeviceList) {
        setOsList(response.data.osDeviceList);
        console.log(" OS Device List : ", response.data.osDeviceList);
      } else {
        console.log("No OS Device List available in response.");
      }
    } catch (error) {
      // Handle error if API call fails

      console.error("Error fetching OS Device list:", error);
    } 
  };


  const GetSMSPhoneNUmbers = async () => {
    
    try {
    //  const response = await axios.get(`${apiUrlAdvAcc}/GetSmsPhoneNumbers`);
      const response = await axios.get(`${apiUrlAdvAcc}/GetSmsPhoneNumbers?workspace_id=` + workspaceId );
      if (response.data && response.data.phoneNumberList) {
        setPhoneNumberList(response.data.phoneNumberList);  // Use correct key
        console.log("Phone List:", response.data.phoneNumberList);
      } else {
        console.log("No phone numbers available in response.");
      }
      
    } catch (error) {
      // Handle error if API call fails

      console.error("Error fetching PhoneList:", error);
    } 
  };

  const GetWhatsappPhoneNumbers = async (prefillShortCode?: string) => {
  try {
    const response = await axios.get(
      `${whatsappUrl}/GetWhatsappPhoneNumbers?workspaceId=${workspaceId}`
    );

    if (response.data.status === "Success") {
      const whatsappData = response.data.data.map((item: any) => ({
        id: item.id, // Store ID
        number: item.display_phone_number, // Store Phone Number
      }));

      setWhatsappNumbers(whatsappData);
      setSelectedShortCode("");
      console.log("Fetched WhatsApp Numbers:", whatsappData);
      if (prefillShortCode) {
        const matched = whatsappData.find((item: { id: string; }) => item.id === prefillShortCode);
        if (matched) {
          setSelectedShortCode(matched.id);
        }
      }

      console.log("Fetched WhatsApp Numbers:", whatsappData);
    } else {
      toast.toast({
        title: "Note",
        description: "No WhatsApp phone numbers found",
      });
    }
  } catch (error) {
    console.error("Error fetching WhatsApp phone numbers:", error);
    toast.toast({
      title: "Error",
      description: "Failed to fetch WhatsApp phone numbers",
    });
  }
};

  const extractTime = (dateTime: string) => {
    return dateTime ? dateTime.split("T")[1].slice(0, 5) : ""; // Extract HH:MM
  }
  const [commentDismissed, setCommentDismissed] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [campaignComment, setCampaignComment] = useState<string | null>(null);

  const getAdminComment = async (campaignId: number) => {
    try {
      const response = await axios.get(`${apiUrlAdvAcc}/GetCampaignNotifications?workspaceId=${workspaceId}`);
  
      const campaignNotifications: Notification[] = response.data.notifications
        .filter((n: any) => n.role?.toLowerCase() === "advertiser")
        .map((campaign: any) => {
          const rawData = campaign.notificationData || {};
          const normalizedData: Record<string, string> = {};
          Object.keys(rawData).forEach((key) => {
            const trimmedKey = key.trim();
            normalizedData[trimmedKey] = rawData[key];
          });
  
          return {
            id: campaign.id,
            campaignId: campaign.campaignId,
            statusMark: campaign.statusMark,
            notificationType: campaign.notificationType,
            createdAt: campaign.createdAt,
            notificationData: normalizedData,
            role: campaign.role
          };
        });
  
      console.log("Fetched Notifications:", campaignNotifications.map(n => ({
        campaignId: n.campaignId,
        comment: n.notificationData?.Comment
      })));

      const matched = campaignNotifications.find(
        (n) => n.campaignId === campaignId && n.notificationData?.Comment
      );
  
      setCampaignComment(matched?.notificationData?.Comment ?? null);
      console.log("Comment:", matched?.notificationData?.Comment);
    } catch (error) {
      console.error("Error fetching campaign notifications:", error);
    }
  };

  function channelFilter(channelTemplate: any): any[] {
    console.log("ChannelT:", channelTemplate);
  
    const channelFilterId = channelList.find(
      (cid) => cid.channelId.toString() === channelTemplate.toString()
    );
  
    const channelFilterName = channelFilterId ? channelFilterId.channelName : "";
  
    const templatefilterlist1 = templateList.filter(
      (tname) =>
        tname.channel_type.trim().toLowerCase() ===
        channelFilterName.trim().toLowerCase()
    );
  
    setTemplatefilterlist(templatefilterlist1);
  
    console.log("Filtered template list:", templatefilterlist1);
  
    return templatefilterlist1;
  }
  
  
  
  const loadCampaignList = async (id: any) => {
    setLoading(true);

    try {  
      const response = await axios.get(
        `${apiUrlAdvAcc}/GetCampaignDetailsById?CampaignId=` + id );

      if (response.data && response.data.campaignDetails) {
        const campaignDetailslocal = response.data.campaignDetails[0];
        // debugger;
        console.log("Campaign List By Id:", campaignDetailslocal);

        setCampaignName(campaignDetailslocal.campaign_name);
        setCampaignBudget(campaignDetailslocal.campaign_budget);
        setUpdateChannel(campaignDetailslocal.channel_type);
        setUpdateTemplate(campaignDetailslocal.template_name);
        setUpdateSenderId(campaignDetailslocal.sms_shortcode);
        setUpdateCountry(campaignDetailslocal.target_country || ""); 
        setUpdateRoamingCountry(campaignDetailslocal.roaming_country || "");

       // dispatch(setTargetCountry(countryIds));
       //  dispatch(setTargetCountry(['3', '4', '14', '43', '44'])

        setUpdateAge(campaignDetailslocal.age);
        setUpdateGender(campaignDetailslocal.gender);
        setUpdateIncomeLevel(campaignDetailslocal.income_level);
        setUpdateLocation(campaignDetailslocal.location);
        setUpdateInterest(campaignDetailslocal.interests);
        setUpdateBehaviour(campaignDetailslocal.behaviours);
        setUpdateDevice(campaignDetailslocal.device);
        setUpdateOsDevice(campaignDetailslocal.os_device);
        setCampaignStartDate(campaignDetailslocal.start_date_time);
        setCampaignEndDate(campaignDetailslocal.end_date_time);
        setCampaignBudget(campaignDetailslocal.campaign_budget);
        setUpdateAudience(campaignDetailslocal.listname);

        setIsAdminApproved(campaignDetailslocal.isAdminApproved);
        setIsOperatorApproved(campaignDetailslocal.isOperatorApproved);
        setBudgetType(campaignDetailslocal.budget_and_schedule);
        setMessageFrequency(campaignDetailslocal.message_frequency);
        setSequentialDelivery(campaignDetailslocal.sequential_delivery);
        setPreventDuplicateMessages(campaignDetailslocal.prevent_duplicate_messages);
        setDailyRecipientLimit(campaignDetailslocal.daily_recipient_limit);
        setDeliveryStartTime(extractTime(campaignDetailslocal.delivery_start_time)); // Sets "10:00"
        setDeliveryEndTime(extractTime(campaignDetailslocal.delivery_end_time)); // Sets "18:00"
        
        const formattedStartDate =
          campaignDetailslocal.start_date_time.split("T")[0];
        handleStartDateChange(new Date(formattedStartDate)); 

        const formattedEndDate =
          campaignDetailslocal.end_date_time.split("T")[0];

        handleEndDateChange(new Date(formattedEndDate)); // Call handleDateChange for the end date
        console.log("API Target Country:", campaignDetailslocal.target_country);
        console.log("API Roam Country:", campaignDetailslocal.roaming_country);
        console.log("Updated State Target Country:", updateCountry);
        console.log("Updated State Roaming Country:", updateRoamingCountry);

       // setReachPeopleIn(['3', '4', '5']);
      // setReachPeopleFrom( campaignDetailslocal.target_country.split(","));
        console.log("UP Target:",reachPeopleFrom);
        console.log("CountryIDO" , countryIds);
 
        const matchedChannel = channelList.find(
          (ch) =>
            ch.channelName.trim().toLowerCase() ===
            campaignDetailslocal.channel_type.trim().toLowerCase()
        );
        
        if (matchedChannel) {
          const channelIdStr = matchedChannel.channelId.toString(); 
        
          setChannel(channelIdStr);
          setUpdateChannel(matchedChannel.channelName);
        
          const filteredTemplates = channelFilter(channelIdStr); 
          setTemplatefilterlist(filteredTemplates);
          const matchedTemplate = filteredTemplates.find(
            (t) =>
              t.template_id.toString() === campaignDetailslocal.template_id.toString()
          );
        
          if (matchedTemplate) {
            setTemplate(matchedTemplate.template_id.toString());
            setUpdateTemplate(matchedTemplate.template_name);
          }

          const lowerChannelName = matchedChannel.channelName.toLowerCase();

          if (lowerChannelName === "sms") {
            getAdvertiserShortCodeMapper(campaignDetailslocal.sms_shortcode);
          } else if (lowerChannelName === "whatsapp") {
            GetWhatsappPhoneNumbers(campaignDetailslocal.sms_shortcode); 
            //setSelectedShortCode(campaignDetailslocal.sms_shortcode); 
          }
        }
        console.log("API returned listname:", campaignDetailslocal.listname);
        console.log(" Audience List Available:", audienceList.map(a => a.listname));
        if (audienceList.length > 0 && campaignDetailslocal.listname) {
          const matchedAudience = audienceList.find(
            (a) =>
              a.listname.trim().toLowerCase() ===
              campaignDetailslocal.listname.trim().toLowerCase()
          );
        
          if (matchedAudience) {
            console.log(" Matched Audience:", matchedAudience);
            setAudience(matchedAudience.list_id); // number
            setUpdateAudience(matchedAudience.listname); // optional
          } else {
            console.warn(" Audience not matched:", campaignDetailslocal.listname);
          }
        } else {
          console.warn(" Audience list empty or campaign listname missing.");
        }
      }

    } catch (error) {
      console.error("Error fetching campaign details:", error);
    } finally {
    }
  };
  
  const isFirstRun = useRef(true);

  // useEffect(() => {
  //   if (!draftCampaign || campaignId !== "" || channelList.length === 0 || templateList.length === 0) return;
  
  //   const storedCampaign = sessionStorage.getItem("draftedCampaign");
  //   if (!storedCampaign) {
  //     dispatch(clearDraftedCampaign());
  //     return;
  //   }
  
  //   if (isFirstRun.current) {
  //     isFirstRun.current = false;
  //   } else {
  //     return;
  //   }
  //   console.log("Draft Mode");
    
  //   setCampaignName(draftCampaign.campaignName || "");
  //   setChannel(draftCampaign.channel || "");
  //   setSelectedShortCode(draftCampaign.selectedShortCode || "");
  //   setReachPeopleFrom(draftCampaign.selectedFromCountry || []);
  //   setReachPeopleIn(draftCampaign.selectedToCountry || []);
  //   setAudience(Number(draftCampaign.audience) || 0);
  //   setBudgetType(draftCampaign.budgetType || "");
  //   setCampaignBudget(draftCampaign.campaignBudget || "");
  //   setCampaignStartDate(draftCampaign.campaignStartDate || "");
  //   setCampaignEndDate(draftCampaign.campaignEndDate || "");
  //   setDailyRecipientLimit( Number(draftCampaign.dailyRecipientLimit) || 0 );
  //   setMessageFrequency(draftCampaign.messageFrequency || "");
  //   setSequentialDelivery(draftCampaign.sequentialDelivery || false);
  //   setPreventDuplicateMessages(draftCampaign.preventDuplicateMessages || false);
  //   setDeliveryStartTime(draftCampaign.deliveryStartTime || "");
  //   setDeliveryEndTime(draftCampaign.deliveryEndTime || "");
   

  //   if (channelList.length === 0) {
  //     console.log("Channel list is empty, skipping channel lookup");
  //     return;
  //   }
  
  //   console.log("draftCampaign.template:", draftCampaign.template);
  //   console.log("templateList:", templateList);
  //   console.log("draftCampaign.audience:", draftCampaign.audience);
  //   console.log("draftCampaign.campaignBudget:", draftCampaign.campaignBudget);
  //   console.log("draftCampaign.budgetType:", draftCampaign.budgetType);
  //   console.log("huii");
   
    

 
  // // // Find matching template
  // // const matchingTemplate = templateList.find(
  // //   (template) => template.template_id.toString() === draftCampaign.template.toString()
  // // );

  // // console.log("Matching Template:", matchingTemplate);

  // // if (matchingTemplate) {
  // //   // Set template value
  // //   setTemplate(matchingTemplate.template_id.toString());  // Set the template value in the dropdown
  // //   dispatch(setDraftedCampaign({ template: matchingTemplate.template_id.toString() })); // Dispatch to update Redux store
  // //   console.log("Template Found:", matchingTemplate);
  // // }

  //   const selectedChannel = channelList.find(
  //     (ch) => ch.channelId.toString() === draftCampaign.channel.toString()
  //   );
  
  //   if (selectedChannel) {
  //     const lowerName = selectedChannel.channelName.toLowerCase();
  
  //     if (lowerName === "whatsapp") {
  //       GetWhatsappPhoneNumbers(draftCampaign.selectedShortCode);
  //       handleTemplateChange(draftCampaign.template);
  //     } else if (lowerName === "sms") {
  //       getAdvertiserShortCodeMapper(draftCampaign.selectedShortCode);
  //       handleTemplateChange(draftCampaign.template);
  //     }
  //   }

  // }, [campaignId, JSON.stringify(draftCampaign), channelList, templateList]);
  
  const updateCountryFrom = () => {
    const countryNamesArray = updateCountry
      ? updateCountry.split(",").map((name: string) => name.trim())
      : [];
  
    const countryIds = countryNamesArray
      .map((countryName: string) => {
        const selectedCountry = targetCountryList.find(
          (findcountry: Country) =>
            findcountry.country_name.trim().toLowerCase() === countryName.toLowerCase()
        );
        return selectedCountry ? selectedCountry.country_id.toString() : null;
      })
      .filter((id: string | null): id is string => id !== null);
  
    const combinedValues = Array.from(new Set([...selectedFromCountryValues, ...countryIds]));
  
    setSelectedFromCountryValues(combinedValues);
    console.log("All country IDs to set: ", countryIds);
    console.log("Final selected values: ", combinedValues);
  };

  const updateCountryTo = () => {
    const countryNamesArray = updateRoamingCountry
      ? updateRoamingCountry.split(",").map((name: string) => name.trim())
      : [];
  
    const countryIds = countryNamesArray
      .map((countryName: string) => {
    const selectedCountry = roamingCountryList.find(
      (findcountry: Country) =>
        findcountry.country_name.trim().toLowerCase() === countryName.toLowerCase()
    );
        return selectedCountry ? selectedCountry.country_id.toString() : null;
      })
      .filter((id: string | null): id is string => id !== null);
  
    
    const combinedValues = Array.from(new Set([...selectedToCountryValues, ...countryIds]));
  
    
    setSelectedToCountryValues(combinedValues);
    console.log("All country IDs to set: ", countryIds);
    console.log("Final selected values: ", combinedValues);
  };
  
  useEffect(()=>{
    if(updateCountry){
      updateCountryFrom();
    }
    if(updateRoamingCountry){
      updateCountryTo();
    }
  },[updateCountry,updateRoamingCountry])



        const countryNamesArray = updateCountry
        ? updateCountry.split(",").map((name: string) => name.trim())
        : [];

        // console.log("Processed Country Names Array:", countryNamesArray);
        // console.log("Available Target Country List:", targetCountryList);
        // Convert country names to country IDs
        
        const countryIds = countryNamesArray.map((countryName: string) => {
       // console.log("Searching for Country Name:", countryName);
        const selectedCountry = targetCountryList.find(
          (findcountry: Country) => findcountry.country_name.trim().toLowerCase() === countryName.toLowerCase()
        );
        if (selectedCountry) {
         // console.log(`Match Found: ${selectedCountry.country_name} -> ID: ${selectedCountry.country_id}`);
        } else {
         // console.log(`No Match Found for: ${countryName}`);
        }
        return selectedCountry ? selectedCountry.country_id.toString() : null;
        }).filter((id: string | null): id is string => id !== null);

       // console.log("Mapped Target Country IDs:", countryIds);



  const convertToISO8601 = (time: string) => {
    // Get the current date in YYYY-MM-DD format
    const today = new Date();
    const baseDate = today.toISOString().split("T")[0]; // Extract only the date part
  
    // Append the time and convert to ISO 8601 format
    const isoDate = new Date(`${baseDate}T${time}:00.000Z`).toISOString();
  
    return isoDate;
  };


  const sendNotification = async (campaignId: number, campaignName: string , campaignType: string) => {
    console.log("campaignId:",campaignId ,campaignName )
    try {
      const payload = {
        workspaceId:  workspaceId,
        campaignId: campaignId,
        campaignName: campaignName ,
        statusMark: "Unread",
        notificationType: "CampaignCreated",
        notificationData: {
          Message: `${workspaceName} has ${campaignType} a new campaign - (${campaignName})  Now !`
        },
        role: "Admin"
      };
      console.log("Notification payload:", payload);
      const response = await axios.post(`${apiUrlAdvAcc}/CreateNotification`, payload);
        
      if (response.data.status === "Success") {
        console.log("SuccessFully Notification Sent to Operator");
      }
    } catch (e) {
      console.log("Notification Error:", e);
    }
    finally {
      try {
        const emailResponse = await axios.post(`${apiUrlAdvAcc}/SendEmailForOperatorCampaign`, null, // No request body
          {
            params: {
              campaignId: campaignId
            }
          }
        );
        console.log("Email API response:", emailResponse.data);
      } catch (emailErr) {
        console.error("Email sending failed:", emailErr);
      }
    }
  };

  const revalidateForm = () => {
    const isFormValid =
      validateCampaignName(campaignName) &&
      validateChannel(channel) &&
      validateTemplate(template) &&
      validateAudience(audience) &&
      validateFromCountry(reachPeopleFrom) &&
      validateInCountry(reachPeopleIn) &&
      validateBudget(campaignBudget) &&
      validateStartDate(campaignStartDate) &&
      validateEndDate(campaignEndDate) &&
      validateDailyLimit() &&
      validateStartTime(deliveryStartTime) &&
      validateEndTime(deliveryEndTime) &&
      validateMessageFrequency(messageFrequency) &&
      ValidateBudgetType(budgetType);
  
    setCanSubmit(isFormValid);
  };
  
  
  const handleSubmit = async () => {
   
    setIsDailyLimitTouched(true);
    setIsFormValidated(true); 
    const selectedChannel = channelList.find(
      (ch) => ch.channelId.toString() === channel?.toString()
    )?.channelName.toLowerCase();

    let selectedNumber = "";
    let smppIdToSend = SMPP_ID;
    let smsConnectionIdToSend = SMS_ConnectionID;
    
    if (selectedChannel === "sms") {
      selectedNumber = SMS_Number;
    } else if (selectedChannel === "whatsapp") {
      selectedNumber = selectedShortCode || "";
      smppIdToSend = 0;
      smsConnectionIdToSend = 0;
    }
    else {
      selectedNumber = "0";
      smppIdToSend = 0;
      smsConnectionIdToSend = 0;
    }

    const isCampaignNameValid = validateCampaignName(campaignName);
    const isChannelValid = validateChannel(channel);
  //  const isSenderValid = validateSenderID(selectedShortCode);
    const isTemplateValid = validateTemplate(template);
    const isAudienceValid = validateAudience(audience);
    //const isAudienceValid = validateAudience(audience.toString());
  //  const isPhoneValid = validatePhoneNumber(selectedPhoneNumber); 
    const isFromCountryValid = validateFromCountry(reachPeopleFrom);
    const isInCountryValid = validateInCountry(reachPeopleIn);
    const isBudgetValid = validateBudget(campaignBudget);
    const isFBudgetValid = validateFBudget();
    const isStartDateValid = validateStartDate(campaignStartDate);
    const isEndDateValid = validateEndDate(campaignEndDate);
   // const areDatesValid = validateDates(campaignStartDate);
    const isAgeValid = validateAge(age);
    const isGenderValid = validateGender(gender);
    const isIncomeLevelValid = validateIncomeLevel(incomeLevel);
    const isLocationValid = validateLocation(locationcity);
    const isInterestValid = validateInterest(interest);
    const isBehaviourValid = validateBehaviour(behaviour);
    const isDeviceValid = validateDevice(device);
    const isOsDeviceValid = validateOsDevice(osDevice);
    const isDailyLimitValid = validateDailyLimit();
    const isValidStartTime = validateStartTime(deliveryStartTime);
    const isValidEndTime = validateEndTime(deliveryEndTime);
    const isValidFrequency = validateMessageFrequency(messageFrequency);
    const isValidBudgetType = ValidateBudgetType(budgetType);

    if (!isDailyLimitValid) {
      setDailyLimitError("Please enter a valid percentage between 1 and 100"); // Ensure error message appears on submit
    }
  
    const isFormValid =
    isCampaignNameValid &&
    isChannelValid &&
    isTemplateValid &&
    isAudienceValid &&
    isFromCountryValid &&
    isInCountryValid &&
    isBudgetValid &&
    isStartDateValid &&
    isEndDateValid &&
    isDailyLimitValid &&
    isValidStartTime &&
    isValidEndTime &&
    isValidFrequency &&
    isValidBudgetType;

  if (!isFormValid) {
    setCanSubmit(false); 
    toast.toast({
      title: "Validation Failed",
      description: "Please correct the highlighted errors before submitting.",
    });
    return;
  }

  setCanSubmit(true); 
  setLoading(true);
    try {
      const data = {
        CampaignName: campaignName,
        CampaignBudget: campaignBudget,
        ChannelType: channel,
        TargetCountry: "[\"3\"]",
        RoamingCountry: "[\"2\"]",
        StartDateTime: formatingDate(campaignStartDate),
        EndDateTime: formatingDate(campaignEndDate),
        status: "In review",
        TemplateName: template,
        CreatedBy: 1,
        UpdatedBy: 1,
        WorkspaceId: workspaceId,
        ListId: Number(audience),
        device_id: device ? device : 0,
        Delivered: "Delivered",
        ReadCampaign: "ReadCampaign",
        CTR: "CTR",
        DeliveryRate: "DeliveryRate",
        ButtonClick: "ButtonClick",
        Age: age ? age : 0,
        Gender: gender ? gender : 0,
        IncomeLevel: incomeLevel ? incomeLevel : 0,
        Location: locationcity ? locationcity : 0,
        interests: interest ? interest : 0,
        behaviours: behaviour ? behaviour : 0,
        OSDevice: osDevice ? osDevice : 0,
        FCampaignBudget: "FCampaignBudget",
        fStartDateTime: "2025-01-02T05:37:38.105Z",
        fEndDateTime: "2025-01-02T05:37:38.105Z",
       // campaignId: 495, // Hardcoded Campaign ID
        isAdminApproved: "", 
        isOperatorApproved: "", 
        budgetAndSchedule: budgetType, 
        messageFrequency: messageFrequency, 
        sequentialDelivery: sequentialDelivery ? "Enabled" : "Disabled",
        preventDuplicateMessages: preventDuplicateMessages? "Enabled" : "Disabled", 
        dailyRecipientLimit: dailyRecipientLimit, 
        deliveryStartTime: convertToISO8601(deliveryStartTime), 
        deliveryEndTime: convertToISO8601(deliveryEndTime),
        smsNumber: selectedNumber,
        smpP_id: smppIdToSend,
        smpP_ConnectionID: smsConnectionIdToSend,
        campaign_existing_budget: campaignBudget,
        currency_symbol: currencySymbol,
        currency_name: currencyName,
        country_name: countryName
      };
      console.log("Submitting campaign data:", data);
      console.log("API Request Payload:", {
      campaignId: campaignId,
      countryIds: reachPeopleFrom.map(Number),
      toCountryNames: reachPeopleIn.map((id) => {
        const country = roamingCountryList.find(c => c.country_id.toString() === id);
        return country ? country.country_name : id;
      }),
    });

      const response = await axios.post(`${apiUrlAdvAcc}/CreateCampaign`, data);

      if (response.data.status === "Success") {
      const campaignId = response.data.campaign_id;
      const campaignType="created";
      console.log(campaignType);
      await sendNotification(campaignId, campaignName,campaignType);
      
            try {
              let response2;
      
              if (audience !== 0) {
                // If audience is selected, call Getcampaigncontacts
                response2 = await axios.get(
                  `${apiUrlAdvAcc}/Getcampaigncontacts?CampaignId=${campaignId}`
                );
              } else if (reachPeopleFrom.length > 0 || reachPeopleIn.length > 0) {
                // If reach people from/to is selected, call GetOperatorsAndInsertCampaignContacts
                        response2 = await axios.post(
                  `${apiUrlAdvAcc}/GetOperatorsByCountry`,  
                  { 
                    campaignId: campaignId ? Number(campaignId) : 0, 
                    countryIds: reachPeopleFrom.map(Number),  
                    toCountryNames: reachPeopleIn.map((id) => {
                      const country = roamingCountryList.find(c => c.country_id.toString() === id);
                      return country ? country.country_name : id;
                    }), 
                  },
                  {
                    headers: { "Content-Type": "application/json" },
                  }
                );
              } 
              if (response2?.data.status === "Success") {
                console.log("Campaign contacts loaded successfully.");
              } else {
                console.log(
                  "API could not fetch campaign contacts for workspace:",
                  response2?.data.Status_Description
                );
              }

            } catch (error) {
              console.log("Error in campaign contact API:", error);
            } finally {
              resetForm();
              toast.toast({
                title: "Success.",
                description: "Campaign Created Successfully.",
              });  
              setTimeout(() => {
                dispatch(setCreateBreadCrumb(false));
                dispatch(setCreateCampaign(true));
              
                sessionStorage.removeItem("draftedTemplate");
                navigate("/navbar/campaignlist");
              }, 1000);
            }
            setLoading(false);
          } else {
            console.error("Upload failed:", response.data.Status_Description);
              // Close();
            
                    toast.toast({
                      title: "Error",
                      description: "The campaign creation failed",
                    });
          }
          setLoading(false);
        } catch (e) {
          console.log("Error in submitting form", e);
           dispatch(setCreateBreadCrumb(false));
                navigate("/navbar/campaignlist");
                console.error("Exception occurred: ", e);
          
                toast.toast({
                  title: "Error",
                  description: "Something error while creating campaign",
                });
        }
  };

  const handleEdit = async () => {
    console.log("channel12 : " + channel + "updatechannel : " + updateChannel);

    // Determine whether to use 'channel' or 'updateChannel'
    const channelToFind = channel || updateChannel;

    // Find the selected channel from the list
    const selectedChannel = channelList.find(
      (findchannel) => findchannel.channelName === channelToFind
    );

    // Get the channel ID, or null if not found
    const updateChannelId = selectedChannel ? selectedChannel.channelId : null;

    // const updateChannelId= channelList.find((data)=>data.channel_name===channel);

    const selectedTemplate = templateList.find(
      (findtemplate) => findtemplate.template_name === updateTemplate
    );
    const updateTemplateId = selectedTemplate
      ? selectedTemplate.template_id
      : null;

    const AudienceToFind = audience || updateAudience;
    const selectedAudience = audienceList.find(
      (findAudience) => findAudience.listname === updateAudience
      
    );
    const updateAudienceId = selectedAudience ? selectedAudience.list_id : null;
    const AgeToFind = age || updateAge;
    const GenderToFind = gender || updateGender;
    const IncomeLevelToFind = incomeLevel || updateIncomeLevel;
    const LocationToFind = locationcity || updateLocation;
    const InterestToFind = interest || updateInterest;
    const BehaviourToFind = behaviour || updateBehaviour;
    const DeviceToFind = device || updateDevice;
    const OsDeviceToFind = osDevice || updateOsDevice;

    //  const selectedAudience = audienceList.find((findAudience) => findAudience.audience_name === AudienceToFind);
    const selectedAge = ageList.find((findAge) => findAge.age === AgeToFind);
    const selectedGender = genderList.find(
      (findGender) => findGender.gender === GenderToFind
    );
    const selectedIncomeLevel = IncomeLevelList.find(
      (findIncomeLevel) => findIncomeLevel.income_level === IncomeLevelToFind
    );
    const selectedLocation = locationList.find(
      (findLocation) => findLocation.location === LocationToFind
    );
    const selectedInterest = interestList.find(
      (findInterest) => findInterest.interest === InterestToFind
    );
    const selectedBehaviour = behaviourList.find(
      (findBehaviour) => findBehaviour.behaviour === BehaviourToFind
    );
    const selectedDevice = deviceList.find(
      (findDevice) => findDevice.device === DeviceToFind
    );
    const selectedOsDevice = osList.find(
      (findOsDevice) => findOsDevice.os_device === OsDeviceToFind
    );

    const updateAgeId = selectedAge ? selectedAge.id : null;
    const updateGenderId = selectedGender ? selectedGender.id : null;
    const updateIncomeLevelId = selectedIncomeLevel
      ? selectedIncomeLevel.id
      : null;
    const updateLocationId = selectedLocation ? selectedLocation.id : null;
    const updateInterestId = selectedInterest ? selectedInterest.id : null;
    const updateBehaviourId = selectedBehaviour ? selectedBehaviour.id : null;
    const updateDeviceId = selectedDevice ? selectedDevice.id : null;
    const updateOsDeviceId = selectedOsDevice ? selectedOsDevice.id : null;
    const updateSenderId = selectedShortCode;
    const countryArray = updateCountry.split(",").map((c) => c.trim()); 
    const countryIds = countryArray
      .map((countryName) => {
        const selectedCountry = targetCountryList.find(
          (findcountry) =>
            findcountry.country_name.trim() === countryName.trim()
        );
        return selectedCountry ? selectedCountry.country_id : null; // Get the country_id or null
      })
      .filter((id) => id !== null); 

      setUpdateCountryId (JSON.stringify(countryIds));

    console.log("updateTargetCountryId 1: ", updateCountryId);
    const roamingCountryArray = updateRoamingCountry.split(","); 
    
    const roamingCountryIds = roamingCountryArray
      .map((countryName) => {
        const selectedCountry = roamingCountryList.find(
          (findcountry) =>
            findcountry.country_name.trim() === countryName.trim()
        );
        return selectedCountry ? selectedCountry.country_id : null; // Get the country_id or null
      })
      .filter((id) => id !== null); 

     setUpdateRoamingCountryId (JSON.stringify(roamingCountryIds));

   // const updateCountry = ["3", "4"];
   console.log("updateCountryIdd" , updateCountryId);
   console.log("updateRoamingCountryy" , updateRoamingCountry);
   const formattedTargetCountry = JSON.stringify(updateCountryId);
   console.log("31" ,formattedTargetCountry); // 👉 "[\"3\",\"4\"]"
    
   const formattedRoamingCountry = JSON.stringify(setUpdateRoamingCountryId);
   console.log("32" ,formattedRoamingCountry); // 👉 "[\"3\",\"4\"]"
   const countryIdsFromUpdate = updateCountry
      .split(",")
      .map((name) => name.trim())
      .map((countryName) => {
        const match = targetCountryList.find(
          (country) => country.country_name === countryName
        );
        return match ? match.country_id.toString() : null;
      })
      .filter(Boolean);

    const roamingCountryIdsFromUpdate = updateRoamingCountry
      .split(",")
      .map((name) => name.trim())
      .map((countryName) => {
        const match = roamingCountryList.find(
          (country) => country.country_name === countryName
        );
        return match ? match.country_id.toString() : null;
      })
      .filter(Boolean);

    const finalReachFrom = reachPeopleFrom.length > 0 ? reachPeopleFrom : countryIdsFromUpdate;
    const finalReachTo = reachPeopleIn.length > 0 ? reachPeopleIn : roamingCountryIdsFromUpdate;

    console.log("Final Reach FROM:", finalReachFrom);
    console.log(" Final Reach TO:", finalReachTo);

    if (
      !validateCampaignName(campaignName) &&
      !validateChannel(channel) &&
      !validateTemplate(template) &&
      !validateAudience(audience) &&
      !validateFromCountry(reachPeopleFrom) &&
      !validateInCountry(reachPeopleIn) &&
      !validateBudget(campaignBudget) &&
      !validateFBudget() &&
      !validateStartDate(campaignStartDate) &&
      !validateEndDate(campaignEndDate) &&
     // !validateDates(campaignStartDate) &&
      !validateAge(age) &&
      !validateGender(gender) &&
      !validateIncomeLevel(incomeLevel) &&
      !validateLocation(locationcity) &&
      !validateInterest(interest) &&
      !validateBehaviour(behaviour) &&
      !validateDevice(device) &&
      !validateOsDevice(osDevice)&&
      !validateDailyLimit()
    ) {
      return;
    }

    try {
      const data = {
        CampaignId: campaignId ? Number(campaignId) : 0,
        CampaignName: campaignName,
        CampaignBudget: String(campaignBudget), 
        ChannelType: updateChannelId ? Number(updateChannelId) : Number(channel),
        // TargetCountry: "[\"3\"]",
        // RoamingCountry: "[\"1\", \"2\"]",
         TargetCountry: JSON.stringify(finalReachFrom),
         RoamingCountry: JSON.stringify(finalReachTo),
        StartDateTime: formatingDate(campaignStartDate),
        EndDateTime: formatingDate(campaignEndDate),
        TemplateName: template === "" ? updateTemplateId : template,
        status: "In review",
        CreatedBy: 1,
        CreatedDate: "2025-01-03T06:55:17.555Z",
        UpdatedBy: 1,
        UpdatedDate: "2025-01-03T06:55:17.555Z",
        WorkspaceId: Number(workspaceId),
        ListId: audience === 0 ? Number(updateAudienceId) : Number(audience),
        deviceId: updateDeviceId ? Number(updateDeviceId) : Number(device),
      
        Delivered: "Delivered",
        ReadCampaign: "ReadCampaign",
        CTR: "CTR",
        DeliveryRate: "DeliveryRate",
        ButtonClick: "ButtonClick",
      
        // ✅ Ensure numeric fields are numbers
        Age: Number(updateAgeId || age),
        Gender: Number(updateGenderId || gender),
        IncomeLevel: Number(updateIncomeLevelId || incomeLevel),
        Location: Number(updateLocationId || locationcity),
        interests: Number(updateInterestId || interest),
        behaviours: Number(updateBehaviourId || behaviour),
        OSDevice: Number(updateOsDeviceId || osDevice),
      
        FCampaignBudget: "FCampaignBudget",
        fStartDateTime: "2025-01-02T05:37:38.105Z",
        fEndDateTime: "2025-01-02T05:37:38.105Z",
    
        isAdminApproved: "Pending",
        isOperatorApproved:"Pending",
      
        budgetAndSchedule: budgetType,
        messageFrequency: messageFrequency,
        sequentialDelivery: "Enabled",
        preventDuplicateMessages: "Disabled",
        dailyRecipientLimit: dailyRecipientLimit,
        deliveryStartTime: convertToISO8601(deliveryStartTime),
        deliveryEndTime: convertToISO8601(deliveryEndTime),
        smsNumber: "",
        smpP_id: 0,
        smpP_ConnectionID: 0,
        campaign_existing_budget: campaignBudget,
        currency_symbol: currencySymbol,
        currency_name: currencyName,
        country_name: countryName
      };
      
      // Send API Request
     // const response = await axios.post(`${apiUrlAdvAcc}/CreateCampaign`, data);
      
      console.log(data);
      // debugger;
      console.log("Channel :" + channel);
      console.log("updateCountry11:" , updateCountry);
      console.log("updateRoamingCountry11:" , updateRoamingCountry);

      const response = await axios.put(`${apiUrlAdvAcc}/UpdateCampaign`, data);
      const campaignType = "edited"
      await sendNotification(campaignId, campaignName , campaignType);

      if (response.data.status === "Success") {
      
              const Close = () => {
                  //setIsLoading(false);
                 dispatch(clearDraftedCampaign());
                  sessionStorage.removeItem("draftedCampaign");
                  navigate("/navbar/campaignlist");
                };
                Close();
                toast.toast({
                  title: "Success",
                  description: "The Campaign details were updated successfully",
                });
      } else {
        console.error("Upload failed:", response.data.Status_Description);
        toast.toast({
          title: "Error",
          description: "An error occurred while updating the campaign details",
        });
        setTimeout(() => {
          /* wait for 1 second */
        }, 1000);
      }
    } catch (e) {
      console.error("Error in submitting form", e);
    }
  };

  const isRussiaOrKazakhstanSelected = (): boolean => {
    const russiaId = targetCountryList.find(
      (country) => country.country_name === "Russia"
    )?.country_id;

    const kazakhstanId = targetCountryList.find(
      (country) => country.country_name === "Kazakhstan"
    )?.country_id;

    // Check Russia selection in both arrays
    const isRussiaSelected =
      !!russiaId && reachPeopleFrom.includes(russiaId.toString());
    const isUpdatedRussiaSelected = updateCountry.includes("Russia");

    console.log("isRussiaSelected:", isRussiaSelected);
    console.log("isUpdatedRussiaSelected:", isUpdatedRussiaSelected);

    // Check Kazakhstan selection in both arrays
    const isKazakhstanSelected =
      !!kazakhstanId && reachPeopleFrom.includes(kazakhstanId.toString());
    const isUpdatedKazakhstanSelected = updateCountry.includes("Kazakhstan");

    console.log("isKazakhstanSelected:", isKazakhstanSelected);
    console.log("isUpdatedKazakhstanSelected:", isUpdatedKazakhstanSelected);

    // Return true if either Russia or Kazakhstan is selected
    return (
      isRussiaSelected ||
      isUpdatedRussiaSelected ||
      isKazakhstanSelected ||
      isUpdatedKazakhstanSelected
    );
  };

  // useEffect(() => {
  //   console.log("updateCountry UE ", updateCountry);
  //   console.log("updateRoamingCountry UE", updateRoamingCountry);

  //   if (
  //     reachPeopleFrom ||
  //     (targetCountryList && targetCountryList.length > 0) ||
  //     (updateCountry && updateCountry.length > 0) ||
  //     (updateRoamingCountry && updateRoamingCountry.length > 0)
  //   ) 
  //   {
  //     setShowRussiaAndKazakhstan(!!isRussiaOrKazakhstanSelected());
  //   }

  // }, [
  //   JSON.stringify(reachPeopleFrom),
  //   JSON.stringify(targetCountryList),
  //   JSON.stringify(updateCountry),
  //   JSON.stringify(updateRoamingCountry),
  // ]);


  // const channelFilter = (channelTemplate: any) => {

  //   console.log("ChannelT : " + channelTemplate);

  //   const channelFilterId = channelList.find(
  //     (cid) => cid.channelId === channelTemplate
  //   );
    

  //   const channelFilterName = channelFilterId
  //     ? channelFilterId.channelName
  //     : "";

  //   const templatefilterlist1 = templateList.filter(
  //     (tname) => tname.channel_type === channelFilterName
  //   );
  //   setTemplatefilterlist(templatefilterlist1);

  //   console.log("Filter list : " + templatefilterlist);
  //  // debugger
  // };

  const getCurrentDateTime = () => {
    const now = new Date();
    return format(now, "MMM dd, yyyy 'at' HH:mm"); // Example: Dec 30, 2024 at 07:55
  };

  return (
    <>   
      <div className="overflow-y-auto ml-[-7px]">
        <Toaster />
{isLoading ? (
      <div className="flex flex-col items-center justify-center h-[500px]">
          <CircularProgress color="success" />
      </div>
    ) : (
      <>
     <div className="fixed flex justify-end gap-4 mr-[40px] items-end right-[0px] top-[-15px] z-20 ">
        
              <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant={"outline"}
                      className="w-[80px] border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                    >
                      Discard
                    </Button>
                  </DialogTrigger>
      
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogDescription>
                        Are you sure you want to discard this campaign?
                      </DialogDescription>
                    </DialogHeader>
      
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button type="button" variant="outline" className="w-24">
                          Cancel
                        </Button>
                      </DialogClose>
      
                      <Button
                        className="w-24"
                        onClick={handleDiscard}
                        autoFocus
                      >
                        OK
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
          <Button
            className="w-[80px] text-[#F8FAFC] form-button"
           // disabled={!canSubmit}
            onClick={() => {
              if (campaignId) {
                handleEdit(); 
                console.log(" Camp Edit go"); 
              } else {
                handleSubmit();
                console.log("camp submit"); // Call handleSubmit if campaignId does not exist
              }
              console.log("Clicked"); // Log the click event
            }}
          >
            {campaignId ? "Update" : "Submit"}
          </Button>
          </div>
          <div className="gap-4 flex ">
            <div className="ml-4">

            <div className="flex mt-2 max-w-[600px] mb-2">
              {campaignComment && !commentDismissed && (
                <div className="flex bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 px-3 py-1.5 text-xs rounded shadow-md w-auto text-center">
                   ⚠️ {campaignComment}
                   <button
                     onClick={() => setCommentDismissed(true)}
                     className="absolute top-0.5 right-2 text-yellow-700 hover:text-yellow-900 text-xs"
                   >
                     ×
                   </button>
                 </div>
             )}

             </div>

             <Card className="w-[600px] mt-2 p-4 shadow-sm">
                  <div className="text-left">
                    <h3 className="text-base font-bold text-[#020617] text-left">
                      Create campaign
                    </h3>
                    <div className="mt-4">
                      <Label
                        htmlFor="campaignName"
                        className="mt-8 font-medium text-[#020617]"
                        style={{ fontSize: "14px" }}
                      >
                        Campaign name
                      </Label>
                      <Input
                        id="campaignName"
                        type="text"
                        placeholder={"New campaign - " + getCurrentDateTime()}
                        value={campaignName}
                        onChange={(e) =>
                          handleCampaignNameChange(e.target.value)
                        }
                        onBlur={() => handleBlur("campaignName")}
                        onFocus={handleFocus}
                        className="mt-2 text-[#64748B] text-sm font-normal"
                      />
                      {campaignNameError && (
                        <p className="text-red-500 text-xs font-medium mt-1 font-sans italic ml-1 text-left">
                          {campaignNameError}
                        </p>
                      )}
                    </div>
                    <div className="mt-4">
                      <Label
                        htmlFor="channel"
                        className="mt-2 font-medium text-[#020617]"
                        style={{ fontSize: "14px" }}
                      >
                        Channel
                      </Label>
                      <Select
                        value={channel}
                        onValueChange={(value) => {
                          handleChannelChange(value);
                          channelFilter(value);
                          console.log("Selected Channel ID:", value);
                          setTemplateError("");
                        }}
                      >
                        <SelectTrigger className="text-gray-500 mt-2 cursor-pointer">
                          <SelectValue
                            className="text-[#64748B] text-sm font-normal cursor-pointer"
                            placeholder={
                              campaignId
                                ? updateChannel
                                : "Select your campaign channel"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {/* ✅ Fix: Remove unnecessary { } wrapping inside JSX */}
                          {channelList.length > 0 ? (
                            channelList.map((channel) => (
                              <SelectItem
                                className="text-[#64748B] text-sm font-normal cursor-pointer"
                                key={channel.channelId}
                                value={channel.channelId.toString()}
                              >
                                {channel.channelName}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="p-2">
                              <button
                                className="text-blue-500 text-sm font-medium cursor-pointer w-full text-left"
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent dropdown from closing immediately
                                  console.log(
                                    "Navigating to /navbar/CreateTemplate"
                                  );
                                  navigate("/navbar/channels", {
                                    state: { route: "Channels" },
                                  });
                                }}
                              >
                                + Create new channel
                              </button>
                            </div>
                          )}
                        </SelectContent>
                      </Select>

                      {channel &&
                        channelList
                          .find(
                            (c) =>
                              c.channelId.toString() === channel.toString()
                          )
                          ?.channelName.toLowerCase() === "sms" && (
                          <div className="mt-4 mb-4">
                            <Label
                              htmlFor="template"
                              className="mt-2 font-medium text-[#020617]"
                              style={{ fontSize: "14px" }}
                            >
                              Sender ID
                            </Label>
                            <Select
                              value={senderid}
                              onValueChange={(value) => {
                                console.log("Selected Sender ID:", value);
                                setSenderid(value);
                              }}
                            >
                              <SelectTrigger className="cursor-pointer">
                                <SelectValue placeholder="Select Sender ID" />
                              </SelectTrigger>
                              <SelectContent>
                                {senderidlist.length > 0 ? (
                                  senderidlist.map((sender) => (
                                    <SelectItem
                                      key={sender.sender_id}
                                      value={sender.sender_id.toString()} // ensure non-empty string value
                                    >
                                      {sender.sender_id}
                                    </SelectItem>
                                  ))
                                ) : (
                                  // Instead of using an empty string value, provide a dummy non-empty value or omit the item.
                                  <SelectItem value="none" disabled>
                                    No sender IDs available
                                  </SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                    </div>

                    <div className="mt-4 mb-4">
                      <Label
                        htmlFor="template"
                        className="mt-2 font-medium text-[#020617]"
                        style={{ fontSize: "14px" }}
                      >
                        Template
                      </Label>
                      <Select
                        value={template}
                        onValueChange={(value) => {
                          if (!channel) {
                            setTemplateError("Please select a channel first");
                            return;
                          }
                          console.log("Selected Template ID:", value);
                          handleTemplateChange(value);
                          setTemplateError("");
                        }}
                        onOpenChange={(isOpen) => {
                          if (isOpen && !channel) {
                            setTemplateError("Please select a channel first");
                          }
                        }}
                      >
                        <SelectTrigger className="text-gray-500 mt-2 cursor-pointer">
                          <SelectValue
                            className="text-[#64748B] text-sm font-normal cursor-pointer"
                            placeholder={
                              campaignId
                                ? updateTemplate
                                : "Select your template to send"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {/* Show Templates if Available */}
                          {templatefilterlist.length > 0 ? (
                            templatefilterlist.map((template) => (
                              <SelectItem
                                className="text-[#64748B] text-sm font-normal cursor-pointer"
                                key={template.template_id}
                                value={template.template_id as any}
                              >
                                {template.template_name}
                              </SelectItem>
                            ))
                          ) : (
                            // Show "Create new template" only when no templates exist
                            <div className="p-2">
                              <button
                                className="text-blue-500 text-sm font-medium cursor-pointer w-full text-left"
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent dropdown from closing immediately
                                  console.log(
                                    "Navigating to /navbar/createCampaign"
                                  );
                                  //navigate("/navbar/CreateTemplate" );
                                  navigate("/navbar/CreateTemplate", {
                                    state: { route: "Templates" },
                                  });
                                }}
                              >
                                + Create new template
                              </button>
                            </div>
                          )}
                        </SelectContent>
                      </Select>

                      {templateError && (
                        <p className="text-red-500 text-xs font-medium mt-1 font-sans italic ml-1 text-left">
                          {templateError}
                        </p>
                      )}

                      <p className="text-gray-500 text-xs mt-1">
                        Note: To start a campaign, you must first create and add
                        a template. Campaigns can only be initiated after a
                        template has been successfully added.
                      </p>
                    </div>
                  </div>
                </Card>

              <Card className="w-[600px] mt-6 p-4 shadow-sm">
                <div className="mt-2 text-left">
                  <h3
                    className="text-base text-[#020617] font-bold text-left"
                    style={{ fontSize: "16px" }}
                  >
                    Target audience
                  </h3>
                  <p
                    className="mt-1"
                    style={{
                      fontWeight: 200,
                      fontSize: "14px",
                      color: "#64748B",
                    }}
                  >
                    Our ad technology automatically finds your audience.
                  </p>
                
                  <div className="mt-4">
                    <Label
                      htmlFor="template"
                      className="mt-2 text-sm font-medium text-[#020617]"
                    >
                      Predefined audiences
                    </Label>
                    <Select
                      value={audience !== 0 ? audience.toString() : undefined} // Dynamically bind selected value
                      onValueChange={(value) => {
                        console.log("Selected audience ID:", value);
                        console.log("Updated audience:", updateAudience);
                        handleAudienceChange(value);
                        //if (isFormValidated) revalidateForm();
                      }}
                    >
                      <SelectTrigger className="text-gray-500 mt-2 cursor-pointer">
                        <SelectValue
                          className="text-[#64748B] text-sm font-normal cursor-pointer"
                          placeholder={"Audience"}
                            />
                      </SelectTrigger>
                      <SelectContent>
                      
                      {audienceList.length > 0 ? (
          audienceList.map((audience) => (
            <SelectItem
              className="text-[#64748B] text-sm font-normal cursor-pointer" 
              key={audience.list_id}
              value={audience.list_id.toString()}
            >
              {audience.listname}
            </SelectItem>
          ))
        ) : (
          // Show "Create Audience" Button if No Audiences Exist
          <div className="p-2">
            <button
              className="text-blue-500 text-sm font-medium cursor-pointer w-full text-left"
              onClick={(e) => {
                e.stopPropagation(); // Prevent dropdown from closing immediately
                console.log("Navigating to /navbar/CreateAudience");
              // navigate("/navbar/CreateAudience", { state: { route: "Audience" } });
              navigate("/navbar/audiences",{state: { route:"Audiences" }});
              }}>
              + Create new audience
            </button>
          </div>
        )}
      </SelectContent>
    </Select>
                    {!isAudienceDisabled && audience !== 0 && AudienceError && (
                      <p className="text-red-500 text-xs font-medium mt-1 font-sans italic ml-1 text-left">{AudienceError}</p>
                    )}

                  <p className="text-gray-500 text-xs mt-2">
                        Note: Selecting a predefined audience disables "Reach people from" and "Reach people traveling to."
                        To re-enable them, select "None" in the predefined audience dropdown. Similarly, selecting those 
                        fields disables the predefined audience option.
                        </p>

                  </div>
                </div>
              </Card>

 {/* Conditional Rendering for Russia and Kazakhstan */}          
          {isCardLoading ? (
              <div className="flex flex-col items-center justify-center h-[500px]">
              <CircularProgress color="primary" />
              </div>
                ) :showRussiaAndKazakhstan ? (
                <Card className="w-[600px] mt-6 p-4 shadow-sm">
                  <div className="mt-2 text-left">
                    <h3 className="text-base text-[#020617] font-bold text-left">
                      Target segment (Russia and Kazakhstan only)
                    </h3>
                    <p
                      className="mt-1"
                      style={{
                        fontWeight: 200,
                        fontSize: "14px",
                        color: "#64748B",
                      }}
                    >
                      Select from the options below.
                    </p>

                    {/* Demographics */}
                    <div className="mt-4 flex space-x-4">
                      <div className="flex-1">
                        <Label
                          htmlFor="age"
                          className="text-sm font-medium text-[#020617] "
                        >
                          Demographics
                        </Label>
                        <Select
                          value={age !== 0 ? age.toString() : undefined} // Dynamically bind selected value
                          onValueChange={(value) => {
                            console.log("Selected age ID:", value);
                            handleAgeChange(value);
                          }}
                        >
                          <SelectTrigger className="text-gray-500 mt-2 flex items-center justify-between px-3 cursor-pointer">
                            <SelectValue
                              placeholder={campaignId ? updateAge : "Age"} // Placeholder or selected value
                              className="text-[#ecf4ff] text-sm font-normal"
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {ageList.map((age) => (
                              <SelectItem
                                className="text-[#64748B] text-sm font-normal cursor-pointer"
                                key={age.id}
                                value={age.id.toString()}
                              >
                                {age.age}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex-1">
                        <Select
                          value={gender !== 0 ? gender.toString() : undefined} // Dynamically bind selected value
                          onValueChange={(value) => {
                            console.log("Selected gender ID:", value);
                            handleGenderChange(value);
                          }}
                        >
                          <SelectTrigger className="text-gray-500 mt-7 flex items-center justify-between px-3 cursor-pointer">
                            <SelectValue
                              placeholder={campaignId ? updateGender : "Gender"} // Placeholder or selected value
                              className="text-[#64748B] text-sm font-normal"
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {genderList.map((gender) => (
                              <>
                                <SelectItem
                                  className="text-[#64748B] text-sm font-normal cursor-pointer"
                                  key={gender.id}
                                  value={gender.id.toString()}
                                >
                                  {gender.gender}
                                </SelectItem>
                              </>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex-1">
                        <Select
                          value={
                            incomeLevel !== 0 ? incomeLevel.toString() : undefined
                          } // Dynamically bind selected value
                          onValueChange={(value) => {
                            console.log("Selected incomeLevel ID:", value);
                            handleIncomeLevelChange(value);
                          }}
                        >
                          <SelectTrigger className="text-gray-500 mt-7 flex items-center justify-between px-3 cursor-pointer">
                            <SelectValue
                              placeholder={
                                campaignId ? updateIncomeLevel : "IncomeLevel"
                              } // Placeholder or selected value
                              className="text-[#64748B] text-sm font-normal cursor-pointer"
                            />
                          </SelectTrigger>
                          <SelectContent className="overflow-y-auto max-h-[200px]">
                            {IncomeLevelList.map((incomeLevel) => (
                              <>
                                <SelectItem
                                  className="text-[#64748B] text-sm font-normal cursor-pointer"
                                  key={incomeLevel.id}
                                  value={incomeLevel.id.toString()}
                                >
                                  {incomeLevel.income_level}
                                </SelectItem>
                              </>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="mt-4">
                      <Label
                        htmlFor="location"
                        className="text-sm font-medium text-[#020617]"
                      >
                        Location
                      </Label>
                      <Select
                        value={
                          locationcity !== 0 ? locationcity.toString() : undefined
                        }
                        onValueChange={(value) => {
                          console.log("Selected location ID:", value);
                          handleLocationChange(value);
                        }}
                      >
                        <SelectTrigger className="text-gray-500 mt-2 flex items-center justify-between px-3 cursor-pointer">
                          <SelectValue
                            className="text-[#64748B] text-sm font-normal"
                            placeholder={
                              campaignId ? updateLocation : "Select city"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent  className="overflow-y-auto max-h-[200px]">
                            {locationList.map((locationcity) => (
                            <>
                              <SelectItem
                                className="text-[#64748B] text-sm font-normal cursor-pointer"
                                key={locationcity.id}
                                value={locationcity.id.toString()}
                              >
                                {locationcity.city}
                              </SelectItem>
                            </>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Interests */}
                    <div className="mt-4">
                      <Label
                        htmlFor="interests"
                        className="text-sm font-medium text-[#020617]"
                      >
                        Interests
                      </Label>

                      <Select
                        value={interest !== 0 ? interest.toString() : undefined} // Dynamically bind selected value
                        onValueChange={(value) => {
                          console.log("Selected interest ID:", value);
                          handleInterestChange(value);
                        }}
                      >
                        <SelectTrigger className="text-gray-500 mt-2 flex items-center justify-between px-3 cursor-pointer">
                          <SelectValue
                            placeholder={
                              campaignId ? updateInterest : "Select interest"
                            } // Placeholder or selected value
                            className="text-[#64748B] text-sm font-normal"
                          />
                        </SelectTrigger>
                        <SelectContent className="overflow-y-auto max-h-[200px]" >
                          {interestList.map((interest) => (
                            <>
                              <SelectItem
                                className="text-[#64748B] text-sm font-normal cursor-pointer"
                                key={interest.id}
                                value={interest.id.toString()}
                              >
                                {interest.interest}
                              </SelectItem>
                            </>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Behaviours */}
                    <div className="mt-4">
                      <Label
                        htmlFor="behaviours"
                        className="text-sm font-medium text-[#020617]"
                      >
                        Behaviours
                      </Label>
                      <Select
                        value={behaviour !== 0 ? behaviour.toString() : undefined}
                        onValueChange={(value) => {
                          console.log("Selected behaviour ID:", value);
                          handleBehaviourChange(value);
                        }}
                      >
                        <SelectTrigger className="text-gray-500 mt-2 flex items-center justify-between px-3 cursor-pointer">
                          <SelectValue
                            className="text-[#64748B] text-sm font-normal cursor-pointer"
                            placeholder={
                              campaignId ? updateBehaviour : "Select Behaviour"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent  className="overflow-y-auto max-h-[200px]">
                          {behaviourList.map((behaviour) => (
                            <>
                              <SelectItem
                                className="text-[#64748B] text-sm font-normal cursor-pointer"
                                key={behaviour.id}
                                value={behaviour.id.toString()}
                              >
                                {behaviour.behaviour}
                              </SelectItem>
                            </>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Device Selection */}
                    <div className="mt-4 mb-4 flex space-x-4">
                      <div className="flex-1">
                        <Label
                          htmlFor="device"
                          className="text-sm font-medium text-[#020617]"
                        >
                          Device
                        </Label>
                        <Select
                          value={osDevice !== 0 ? osDevice.toString() : undefined}
                          onValueChange={(value) => {
                            console.log("Selected OS Device ID:", value);
                            handleOsDeviceChange(value);
                          }}
                        >
                          <SelectTrigger className="text-gray-500 mt-2 flex items-center justify-between px-3 cursor-pointer">
                            <SelectValue
                              className="text-[#64748B] text-sm font-normal cursor-pointer"
                              placeholder={
                                campaignId
                                  ? updateOsDevice
                                  : "Select operating system"
                              }
                              //placeholder="Select operating system"
                            />
                          </SelectTrigger>
                          <SelectContent className="overflow-y-auto max-h-[200px]">
                            {osList.map((os_device) => (
                              <>
                                <SelectItem
                                  className="text-[#64748B] text-sm font-normal cursor-pointer"
                                  key={os_device.id}
                                  value={os_device.id.toString()}
                                >
                                  {os_device.os_device}
                                </SelectItem>
                              </>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex-1">
                        <Select
                          value={device !== 0 ? device.toString() : undefined}
                          onValueChange={(value) => {
                            console.log("Selected Device ID:", value);
                            console.log("ccurency:", currency);
                            handleDeviceChange(value);
                          }}
                        >
                          <SelectTrigger className="text-gray-500 mt-7 mr-6 flex items-center justify-between px-3 cursor-pointer">
                            <SelectValue
                              className="text-[#64748B] text-sm font-normal cursor-pointer"
                              placeholder={
                                campaignId ? updateDevice : "Select device"
                              }
                              // placeholder="Select device"
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {deviceList.map((device) => (
                              <>
                                <SelectItem
                                  className="text-[#64748B] text-sm font-normal cursor-pointer"
                                  key={device.id}
                                  value={device.id.toString()}
                                >
                                  {device.device}
                                </SelectItem>
                              </>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </Card>
            ) : null}

              <Card className="w-[600px] mt-6 p-4 shadow-sm border border-gray-200">
                <div className="mt-2 text-left">
                  <h3 className="text-base text-[#020617] font-semibold text-left">
                    Budget & schedule
                  </h3>
                  <div className="mt-4 flex gap-4">
                    {/* Budget Type Dropdown */}
                    <div className="flex-1">
                      <Label
                        htmlFor="budgetType"
                        className="text-sm font-normal text-[#020617]"
                      >
                        Budget type
                      </Label>
                      <Select
                        value={budgetType}
                        onValueChange={(value) => {
                          handleBudgetTypeChange(value);
                         // if (isFormValidated) revalidateForm();
                          }} >
                        <SelectTrigger className="mt-2 w-full cursor-pointer border border-input bg-background ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring">
                          <SelectValue placeholder="Select budget type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Daily budget" className="cursor-pointer">Daily budget</SelectItem>
                          <SelectItem value="Lifetime budget" className="cursor-pointer">Lifetime budget</SelectItem>
                        </SelectContent>
                      </Select>
                      {budgetTypeError && <p className="text-red-500 text-xs font-medium mt-1 font-sans italic ml-1 text-left">{budgetTypeError}</p>}
                    </div>

                    {/* Budget Amount Input */}
                    <div className="flex-1">
                    <Label
                      htmlFor="campaignBudget"
                      className="text-sm font-medium text-[#020617]"
                    >
                      {budgetType ? budgetType : "Campaign budget"}
                    </Label>
                    <div className="relative mt-2">
                    <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring">
                  {/* <span className="flex items-center text-gray-500">$</span>*/}
                    <span className="flex items-center text-gray-500 mr-2">
                        {currencyData.length > 0
                          ? currencyData[0].symbol
                          : ""}
                      </span>
                      <input
                        id="campaignBudget"
                        type="number"
                        value={campaignBudget}
                        placeholder="10.00"
                        step="0.01"  // Allows only up to two decimal places
                        min="0.01" 
                        max="9999999999.99"
                        className="w-full border-0 bg-transparent p-0 pl-1 focus:outline-none focus:ring-0"
                        onChange={(e) => { handleCampaignBudgetChange(e);
                        //  if (isFormValidated) revalidateForm();
                          }}
                        onFocus={handleFocus}
                        //onBlur={() => handleBlur('campaignBudget')}
                        onBlur={() => validateBudget(campaignBudget)}
                      />
                      <span className="text-[#64748B] text-sm font-normal">
                        {currencyData.length > 0
                          ? currencyData[0].currency_name
                          : ""}
                      </span>
                    </div>
                    {budgetError && (
                      <p className="text-red-500 text-xs font-medium mt-1 font-sans italic ml-1 text-left">{budgetError}</p>
                    )}
                  </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Label
                      htmlFor="campaignStartDate"
                      className=" mt-2 text-sm font-medium text-[#020617]"
                    >
                      Campaign start date
                    </Label>
                    <div className="relative w-full flex items-center border border-gray-300 rounded px-2">
                      <input
                        id="campaignStartDate"
                        type="text"
                        value={campaignStartDate}
                        onChange={(e) => {

                        const input = e.target.value.trim();
                          if (/^[0-9/]*$/.test(input)) return;
                        
                            setCampaignStartDate(input);
                      
                          setTimeout(() => {
                          const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
                          if (!dateRegex.test(input)) {
                            setStartDateError("Invalid date format (dd/MM/yyyy required)");
                            return;
                          }

                            const [day, month, year] = campaignStartDate.split("/").map(Number);
                            const dateValue = new Date(year, month - 1, day);

                          if (isNaN(dateValue.getTime())) {
                            setStartDateError("Invalid date format");
                            return;
                          }
                          setStartDateError(null);
                          handleStartDateChange(dateValue);
                         // if (isFormValidated) revalidateForm();
                        }, 50); 
                        }}
                        onFocus={handleFocus}
                        onBlur={() => {
                          if (!campaignStartDate.trim()) {
                            setStartDateError("Start date is required"); // Reset error if field is empty
                            return;
                          }                         
                        }}
                        placeholder="dd/mm/yyyy"
                        style={{ fontSize: "14px" }}
                        className="w-full p-2 text-[#64748B] text-sm font-normal pr-10 bg-transparent focus:outline-none"
                      />                  
                      <Popover
                        open={isStartCalendarOpen}
                        onOpenChange={setStartCalendarOpen}
                      >
                        <PopoverTrigger asChild>
                          <button className="absolute right-2 top-1/2 transform -translate-y-1/2">
                            <CalendarIcon className="text-gray-500" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent>
                          <Calendar
                            mode="single"
                            selected={
                              campaignStartDate
                                ? new Date(
                                    campaignStartDate
                                      .split("/")
                                      .reverse()
                                      .join("-")
                                  )
                                : undefined
                            }
                            onSelect={(date) => {
                              if (!date) {
                                setStartDateError("Start date is required"); // Reset error when clearing the selection
                                return;
                              }
                              handleStartDateChange(date);
                            
                            }}
                          disabled={(date: Date) => isStartDateDisabled(date)} // Disable dates before today
                        />
                        </PopoverContent>
                      </Popover>
                    
                    </div>
                    {startdateError && (
                        <p className="text-red-500 text-xs font-medium mt-1 font-sans italic ml-1 text-left">{startdateError}</p>
                      )}
                  </div>
                  <div className="mt-4">
                  <Label
                    htmlFor="campaignEndDate"
                    className="mt-2 text-sm font-medium text-[#020617]"
                  >
                    Campaign end date
                  </Label>
                  <div className="relative w-full flex items-center border border-gray-300 rounded px-2">
                    <input
                      id="campaignEndDate"
                      type="text"
                      value={campaignEndDate}
                      onChange={(e) => {
                        const input = e.target.value;
                        // Allow only numbers and `/`
                        if (/^[0-9/]*$/.test(input)) {
                          setCampaignEndDate(input);
                        }
                       // if (isFormValidated) revalidateForm();
                      }}
                      onFocus={handleFocus}
                      onBlur={() => {
                        if (!campaignEndDate.trim()) {
                          setEndDateError("End date is required"); // Reset error if field is empty
                          return;
                        }
                        const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
                        if (!dateRegex.test(campaignEndDate)) {
                          setEndDateError("Invalid date format (dd/MM/yyyy required)");
                          return;
                        }
                        const [day, month, year] = campaignEndDate.split("/").map(Number);
                        const dateValue = new Date(year, month - 1, day);

                        if (isNaN(dateValue.getTime())) {
                          setEndDateError("Invalid date format");
                          return;
                        }
                        handleEndDateChange(dateValue);
                      }}
                      placeholder="dd/mm/yyyy"
                      style={{ fontSize: "14px" }}
                      className="w-full p-2 text-[#64748B] text-sm font-normal pr-10 bg-transparent focus:outline-none"
                    />
              
                    <Popover open={isEndCalendarOpen} onOpenChange={setEndCalendarOpen}>
                      <PopoverTrigger asChild>
                        <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <CalendarIcon className="text-gray-500" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent>
                        <Calendar
                          mode="single"
                          selected={
                            campaignEndDate
                              ? new Date(campaignEndDate.split("/").reverse().join("-"))
                              : undefined
                          }
                          onSelect={(date) => {
                            if (!date) {
                              setEndDateError("End date is required"); // Reset error when clearing the selection
                              return;
                            }
                            handleEndDateChange(date);
                          }}
                          disabled={(date: Date) => isEndDateDisabled(date)} // Disable dates before start date
                        />
                      </PopoverContent>
                    </Popover>
                    </div>
                  {enddateError && (<p className="text-red-500 text-xs font-medium mt-1 font-sans italic ml-1 text-left">{enddateError}</p> )}
                </div>
                </div>
              </Card>
              <Card className="w-[600px] mt-6 mb-[100px] p-4 shadow-sm border border-gray-200">
                <div className="mt-2 text-left">
                  <h3 className="text-base font-semibold text-gray-900"> Frequency & caps</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Control how your campaign messages are delivered to recipients
                  </p>
                  {/* Daily Recipient Percentage */}
                  <div className="mt-4">
                    <Label htmlFor="dailyPercentage" className="text-sm font-medium text-gray-900">
                      Daily recipient limit
                    </Label>
                    <div className="mt-2 relative">
                      <Input
                        id="dailyPercentage"
                        type="number"
                        placeholder="Enter Daily recipient limit"
                        min="1"
                        max="100"
                        className="pr-12 text-gray-500"
                        value={dailyRecipientLimit}
                        onChange={(e)=> {handleDailyLimitChange(e);
 
                         }}
                        onBlur={validateDailyLimit}
                        onFocus={() => setIsDailyLimitTouched(true)}
                      />
                    
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <span className="text-gray-500 text-sm">%</span>
                      </div>
                    </div>
                    {dailyLimitError && <p className="text-red-500 text-xs font-medium mt-1 font-sans italic ml-1 text-left">{dailyLimitError}</p>}
                    <p className="mt-1 text-sm text-gray-500">
                      Percentage of total recipients to message each day
                    </p>
                  </div>

                  {/* Message Frequency */}
                  <div className="mt-6">
                    <Label className="text-sm font-medium text-gray-900">
                      Message frequency
                    </Label>
                    <div className="mt-2">
                    <Select 
                    value={messageFrequency ?? undefined} 
                    onValueChange={(value) =>{
                      setMessageFrequency(value)  
                      validateMessageFrequency(value);
                      dispatch(setDraftedCampaign({ messageFrequency: value }));
                    }}>
                        <SelectTrigger className="w-full cursor-pointer">
                          <SelectValue placeholder="Select sending frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Every Day" className="cursor-pointer">Every day</SelectItem>
                          <SelectItem value="Every 2 Days" className="cursor-pointer">Every 2 days</SelectItem>
                          <SelectItem value="Every 3 Days" className="cursor-pointer">Every 3 days</SelectItem>
                          <SelectItem value="Once a Week" className="cursor-pointer">Once a week</SelectItem>
                          {/* <SelectItem value="Every 2 Weeks" className="cursor-pointer">Every 2 weeks</SelectItem>
                          <SelectItem value="Once a Month" className="cursor-pointer">Once a month</SelectItem> */}
                        </SelectContent>
                      </Select>
                      {messageFrequencyError && <p className="text-red-500 text-xs font-medium mt-1 font-sans italic ml-1 text-left">{messageFrequencyError}</p>}
                      <p className="mt-1 text-sm text-gray-500">
                        Define how often the campaign messages should be sent
                      </p>
                    </div>
                  </div>

                  {/* Message Queue Settings */}
                  <div className="mt-6">
                    <Label className="text-sm font-medium text-gray-900">
                      Message delivery schedule
                    </Label>
                    <div className="mt-2 space-y-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="sequential"
                          checked={sequentialDelivery ?? false}
                          onCheckedChange={(value) => {
                            setSequentialDelivery(value);
                            dispatch(setDraftedCampaign({ sequentialDelivery: value }));
                          }}
                        />

                        <Label htmlFor="sequential" className="text-sm text-gray-600">
                          Enable sequential delivery
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                      <Switch
                          id="deduplication"
                          checked={preventDuplicateMessages ?? false}
                          onCheckedChange={(value) => {
                            setPreventDuplicateMessages(value);
                            dispatch(setDraftedCampaign({ preventDuplicateMessages: value }));
                        }}
                        />
                        <Label htmlFor="deduplication" className="text-sm text-gray-600">
                          Prevent duplicate messages
                        </Label>
                        <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                          Recommended
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Time Window */}
                  <div className="mt-6">
                    <Label className="text-sm font-medium text-gray-900">
                      Delivery time window
                    </Label>
                    <div className="mt-2 flex gap-4">
                      <div className="flex-1">
                      <Select 
                      value={deliveryStartTime || undefined}
                      onValueChange={(value) =>{

                      setDeliveryStartTime(value);
                      validateStartTime(value);
                      dispatch(setDraftedCampaign({ deliveryStartTime: value }));
                      // validateEndTime(deliveryEndTime);
                      }}>
                          <SelectTrigger className='cursor-pointer'>
                            <SelectValue placeholder="Start time" />
                          </SelectTrigger>
                          <SelectContent>
                          <SelectItem value="10:00" className="cursor-pointer">10:00</SelectItem>
                          <SelectItem value="11:00" className="cursor-pointer">11:00</SelectItem>
                            <SelectItem value="12:00" className="cursor-pointer">12:00</SelectItem>
                            <SelectItem value="13:00" className="cursor-pointer">13:00</SelectItem>
                            <SelectItem value="14:00" className="cursor-pointer">14:00</SelectItem>
                          </SelectContent>
                        </Select>
                        {startTimeError && <p className="text-red-500 text-xs font-medium mt-1 font-sans italic ml-1 text-left">{startTimeError}</p>}
                      </div>
                      <div className="flex-1">
                        <Select value={deliveryEndTime} onValueChange={(value) => {
                
                          setDeliveryEndTime(value);
                          dispatch(setDraftedCampaign({ deliveryEndTime: value }));
                          validateEndTime(value);}}>
                          <SelectTrigger>
                            <SelectValue placeholder="End time" />
                          </SelectTrigger>
                          <SelectContent>
                            
                            <SelectItem value="19:00" className="cursor-pointer">19:00</SelectItem>
                            <SelectItem value="20:00" className="cursor-pointer">20:00</SelectItem>
                            <SelectItem value="21:00" className="cursor-pointer">21:00</SelectItem>
                            <SelectItem value="22:00" className="cursor-pointer">22:00</SelectItem>
                            <SelectItem value="23:00" className="cursor-pointer">23:00</SelectItem>
                          </SelectContent>
                        </Select>
                        {endTimeError && <p className="text-red-500 text-xs font-medium mt-1 font-sans italic ml-1 text-left">{endTimeError}</p>}
                      </div>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      Messages will only be sent during this time window
                    </p>
                  </div>
                </div>
              </Card>

            </div>
            <div className="mt-2 mb-8 ml-auto fixed top-16 right-3 w-[380px] p-4">
              <Card className="w-full max-w-[350px] p-4 rounded-lg shadow-sm border border-gray-200">
                {/* Title */}
                <h3 className="text-md text-[#020617] font-semibold text-left">
                  Audience size
                </h3>
                <div className="mt-10 flex flex-col items-center justify-center">
                  <div className="w-[170px] h-[170px] relative flex items-center justify-center">
                    <CircularProgressbar
                      value={percentage}
                      styles={buildStyles({
                        textSize: "30px",
                        pathColor: "#1a7727", 
                        textColor: "#1C2024", 
                        trailColor: "#f0f0f0",
                        strokeLinecap: "round", 
                      })}
                    />
                    <div className="flex flex-col items-center justify-center absolute">
                      <span className="text-[30px] font-bold text-[#1C2024]">
                        {selectedRecipients.toLocaleString()}
                      </span>
                      <div className="flex items-center gap-1 font-normal  text-[#64748B] text-[12px] mt-1">
                        <LuPlane className="text-[#64748B]" />
                        Recipients
                      </div>
                    </div>
                  </div>
                </div>
                <div className="ml-4"> 
                <div className="mt-4 text-center text-[14px] space-x-8 text-[#1C2024] font-medium">
                {audience !== 0
                  ? `${(SelectedRecipientsFromAud ?? 0).toLocaleString()} out of ${(totalRecepientsdFromAud ?? 0).toLocaleString()} total recipients`
                  : reachPeopleFrom.length !== 0
                  ? `${(SelectedRecipientsFromOP ?? 0).toLocaleString()} out of ${(totalRecipientsFromOP ?? 0).toLocaleString()} total recipients`
                  : `${(initialSelectedRecipients ?? 0).toLocaleString()} out of ${(initialTotalRecipients ?? 0).toLocaleString()} total recipients`}
                </div>

                  <div className="flex pl-16 pr-16 items-start mt-4 pt-2">
                    <FontAwesomeIcon
                      className="text-[#64748B] text-[10px] mt-[2px]"
                      icon={faArrowTrendUp} />
                    <p className="text-[10px] font-medium text-[#64748B] text-left leading-relaxed">
                      The accuracy of estimates is based on factors such as past campaign data, the budget you entered, market data,
                      targeting criteria, and channel numbers. These estimates are provided to give you an idea of performance for your budget,
                      but are only estimates and don't guarantee results.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
          </>
          )}
      </div>
    </>

  );
}
