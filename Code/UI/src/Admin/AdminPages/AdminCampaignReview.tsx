import { Button } from "../../Components/ui/button";
import { Card } from "../../Components/ui/card";
import { Label } from "../../Components/ui/label";
import Default_WhatsApp_background from "../../Assets/Default_WhatsApp_background.jpeg";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectContent,
  SelectValue,
} from "../../Components/ui/select";
import { Input } from "../../Components/ui/input";

import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { useState, SetStateAction, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; // Import FontAwesomeIcon component
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
import { SetCampaignInReviewCount } from "../../State/slices/AdminSlice";

import { MultiSelect } from "../../Components/ui/multi-select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../Components/ui/popover";
import { cn } from "../../lib/utils";
import { useDispatch, useSelector } from "react-redux";
import { setCreateBreadCrumb } from "../../State/slices/AdvertiserAccountSlice";
import { RootState } from "@/src/State/store";
import { FaPaperPlane } from "react-icons/fa";
import { LuPlane } from "react-icons/lu";
import { CircularProgress } from "@mui/material";
// import { useToast } from "react-toastify";

interface BoxItem {
  action: string;
}

interface RowData {
  buttonType: string;
  buttonText: string;
  buttonTypeDropdown: string;
  websiteUrl: string;
  countryCode: string;
  callPhoneNumber: string;
  copyOfferCode: string;
}

interface AudienceCardProps {
  selectedRecipients: number;
  totalRecipients: number;
}

// Define the Country type
interface Country {
  country_id: number;
  country_name: string;
}

interface multiselect {
  country_id: string;
}

interface Template {
  template_id: number;
  template_name: string;
  channel_type: string;
}

interface Channel {
  channel_id: number;
  channel_name: string;
}

interface Age {
  id: number;
  age: string;
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
}

interface SmppServerList {
  serverId: number;
  serverName: string;
  serverType: string;
  serverUrl: string;
}

interface connecectionList {
  channelName: string;
  id: number;
  type: string;
  host: string;
  port: number;
  systemId: string;
  password: string;
  created_date: string;
}

const DatePickerWithRange: React.FC<DatePickerWithRangeProps> = ({
  className,
}) => {
  // Initialize the date range with the 1st of the current month and today's date
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

export default function AdminCampaignReview() {
  const [campaignName, setCampaignName] = useState<string>("");

  const [channelList, setChannelList] = useState<Channel[]>([]); // State for the channel list
  const [templatefilterlist, setTemplatefilterlist] = useState<Template[]>([]);
  const [channel, setChannel] = useState("");
  const [smsServer, setSmsServer] = useState<number | undefined>(0);
  const [templateList, setTemplateList] = useState<Template[]>([]);
  const [audienceList, setAudienceList] = useState<Audience[]>([]);
  const [template, setTemplate] = useState("");
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
  const [updateCountry, setUpdateCountry] = useState("");
  const [selectedFrameworks, setSelectedFrameworks] = useState<string[]>([
    "react",
    "angular",
  ]);
  const [updateRoamingCountry, setUpdateRoamingCountry] = useState("");
  const [loading, setLoading] = useState(false);
  const selectedRecipients = 1240;
  const totalRecipients = 3448;
  const percentage = Math.round((selectedRecipients / totalRecipients) * 100);
  const navigate = useNavigate();
  const location = useLocation();
  const campaignId = location.state?.campaignId || "";
  const campaignStatus = location.state?.status || "";
  
  const campaignWorkspaceId = location.state?.campaignWorkspaceId || 0;
  console.log("campaignWorkspaceId : " + campaignWorkspaceId);
  let templateId = "";
  const [approvedServerId, setApprovedServerId] = useState<number>(0);
  const [approvedSmsConnectionId, setApprovedSmsConnectionId] = useState<number>(0);
  const channelName = location.state?.channelType || "";
  const [campaignNameError, setCampaignNameError] = useState<string | null>(
    null
  );
  const [channelError, setChannelError] = useState<string | null>(null);
  const [smsServerError, setSmsServerError] = useState<string | null>(null);
  const [smsConnectionError, setSmsConnectionError] = useState<string | null>(
    null
  );
  const [templateError, setTemplateError] = useState<string | null>(null);
  const [budgetError, setBudgetError] = useState<string | null>(null);
  const [FbudgetError, setFBudgetError] = useState<string | null>(null);
  const [startdateError, setStartDateError] = useState<string | null>(null);
  const [enddateError, setEndDateError] = useState<string | null>(null);
  const [FstartdateError, setFStartDateError] = useState<string | null>(null);
  const [FenddateError, setFEndDateError] = useState<string | null>(null);
  const [targetCountryError, setTargetCountryError] = useState<string | null>(
    null
  );
  const [roamingCountryError, setRoamingCountryError] = useState<string | null>(
    null
  );
  const [apiUrlAdvAcc, setApiUrlAdvAcc] = useState("");
  const [adminapiUrlAdvAcc, setAdminApiUrlAdvAcc] = useState("");
  const [apiUrlSms, setapiUrlSms] = useState("");
  const [isStartCalendarOpen, setStartCalendarOpen] = useState(false);
  const [isFStartCalendarOpen, setFStartCalendarOpen] = useState(false);
  const [isEndCalendarOpen, setEndCalendarOpen] = useState(false);
  const [isFEndCalendarOpen, setFEndCalendarOpen] = useState(false);
  const dispatch = useDispatch();
  const toast = useToast();
  const [isFocusedOrHasValue, setIsFocusedOrHasValue] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [audience, setAudience] = useState("");
  const workspaceId = useSelector(
    (state: RootState) => state.authentication.workspace_id
  );
  const CampaignInReviewCount = useSelector(
    (state: RootState) => state.admin.InReviewCount
  );

  const [selectedTargetCountries, setSelectedTargetCountries] = useState<
    string[]
  >([]);
  const [selectedRoamingCountries, setSelectedRoamingCountries] = useState<
    string[]
  >([]);
  const [ageList, setAgeList] = useState<Age[]>([]);
  const [genderList, setGenderList] = useState<Gender[]>([]);
  const [IncomeLevelList, setIncomeLevelList] = useState<IncomeLevel[]>([]);
  const [locationList, setLocationList] = useState<Location[]>([]);
  const [interestList, setInterestList] = useState<Interest[]>([]);
  const [behaviourList, setBehaviourList] = useState<Behaviour[]>([]);
  const [deviceList, setDeviceList] = useState<Device[]>([]);
  const [osList, setOsList] = useState<OS[]>([]);
  let HeaderSelectedOption = "";
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [updateHeaderType, setUpdateHeaderType] = useState<string>("");
  const [textInput, setTextInput] = useState<string>("");
  let headerText = "";
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [bodyText, setBodyText] = useState<string>("");
  const [boxes, setBoxes] = useState<BoxItem[]>([]);
  const [FooterText, setFooterText] = useState<string>("");
  const [rows, setRows] = useState<RowData[]>([]);
  const [selectedButtonIds, setSelectedButtonIds] = useState<string[]>([]);
  const [buttonText, setButtonText] = useState<string>("");
  const [templatePreview, setTemplatePreview] = useState<string>("");
  const [showRussiaAndKazakhstan, setShowRussiaAndKazakhstan] = useState(false);
  const [smppServers, setSmppServers] = useState<SmppServerList[]>([]);
  const [smsConnectionList, setSmsConnectionList] = useState<
    connecectionList[]
  >([]);
  const [smsConnection, setSmsConnection] = useState<number | undefined>(0);
  const [comment, setComment] = useState("");
  const [updateComment, SetUpdateComment] = useState(false);
  const smsUrl = useSelector((state: RootState) => state.authentication.smsUrl);

  const [campaignApprovalStatus, setCampaignApprovalStatus] =
    useState<boolean>(true);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCampaignBudget(value);
    setIsFocusedOrHasValue(value.trim() !== "");
  };

  const handleFocus = () => {
    setIsFocusedOrHasValue(true);
  };

  const handleBlur = () => {
    if (campaignBudget === "") {
      setIsFocusedOrHasValue(false);
    }
  };

  // Handle start date change
  const currentDate = new Date();

  // Handle start date change
  // Handle Campaign Start Date Change
  const handleStartDateChange = (date: Date | undefined) => {
    if (date) {
      setCampaignStartDate(format(date, "dd/MM/yyyy"));
      setStartCalendarOpen(false); // Close the calendar
    }
  };

  // Handle Frequency Start Date Change
  const handleFrequencyStartDateChange = (date: Date | undefined) => {
    if (date) {
      setFCampaignStartDate(format(date, "dd/MM/yyyy"));
      setFStartCalendarOpen(false); // Close the calendar
    }
  };

  // Handle end date change
  const handleEndDateChange = (date: Date | undefined) => {
    if (date) {
      setCampaignEndDate(format(date, "dd/MM/yyyy"));

      setEndCalendarOpen(false); // Close the calendar after date selection
    }
  };

  const handleFrequencyEndDateChange = (date: Date | undefined) => {
    if (date) {
      setFCampaignEndDate(format(date, "dd/MM/yyyy"));
      setFEndCalendarOpen(false); // Close the calendar
    }
  };

  // Disable dates before the current date for start date
  const isStartDateDisabled = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to midnight
    date.setHours(0, 0, 0, 0); // Set the passed date to midnight for comparison
    return date < today; // Compare the date only (ignoring time)
  };

  const isEndDateDisabled = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to midnight
    date.setHours(0, 0, 0, 0); // Set the passed date to midnight for comparison

    if (campaignStartDate) {
      const startDate = new Date(
        campaignStartDate.split("/").reverse().join("-")
      );
      startDate.setHours(0, 0, 0, 0); // Ensure startDate is also at midnight

      // Disable dates before today OR before the start date
      return date < today || date < startDate;
    }

    if (FcampaignStartDate) {
      const startDate = new Date(
        FcampaignStartDate.split("/").reverse().join("-")
      );
      startDate.setHours(0, 0, 0, 0); // Ensure startDate is also at midnight

      // Disable dates before today OR before the start date
      return date < today || date < startDate;
    }
    // Default condition if no start date is selected
    return date < today;
  };

  const formatingDate = (dateString: string) => {
    // debugger;
    const [day, month, year] = dateString.split("/").map(Number);
    // Create a new Date object (months are zero-indexed in JS)
    // Create a new Date object in UTC
    const dateUTC = new Date(Date.UTC(year, month - 1, day));
    // debugger;
    return dateUTC.toISOString();
    // debugger;
  };

  const formatDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, "0"); // Get day and pad with zero if needed
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Get month (0-11) and pad
    const year = date.getFullYear(); // Get the full year

    return `${day}/${month}/${year}`; // Return formatted date string
  };

  useEffect(() => {
    updateTemplatePreview();
  }, [
    bodyText,
    boxes,
    FooterText,
    //file,
    //headerType,
    //buttonData,
    buttonText,
    //websiteUrl,
  ]);

  // Fetch config on component mount
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch("/config.json");
        const config = await response.json();
        console.log("Config loaded:", config); // Debugging log
        setApiUrlAdvAcc(config.ApiUrlAdvAcc);
        setAdminApiUrlAdvAcc(config.ApiUrlAdminAcc);
        setapiUrlSms(config.SmsUrlAdminAcc); // Set API URL from config
      } catch (error) {
        console.error("Error loading config:", error);
      }
    };

    fetchConfig();
  }, []); // Runs only once on mount

  // Watch for apiUrlAdvAcc and campaignId to change and fetch data
  useEffect(() => {
    const fetchData = async () => {
      if (apiUrlAdvAcc) {
        console.log(
          "Fetching data for apiUrlAdvAcc:",
          apiUrlAdvAcc,
          "campaignId:",
          campaignId
        ); // Debugging log
        try {
          await getChannelList(); // Load the channel list
          await getCountryList(); // Fetch countries
          //await getTemplateList();
          await getAudienceList();
          await getTargetCountryList();
          await getRoamingCountryList();
          await getAgeList();
          await getGenderList();
          await GetIncomeLevelList();
          await GetLocationList();
          await GetInterestList();
          await GetBehaviourList();
          await GetDeviceList();
          await GetOSDeviceList();

          if (campaignId) {
            await GetAdminApprovalStatus(campaignId);

            await loadCampaignList(campaignId);
            await loadSmppServerList();
            debugger;
          }
          debugger;
          if (templateId) {
            debugger;
            await loadTemplateList(templateId); // Load templates based on templateId
          }
          console.log("Data fetched successfully");
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      } else {
        console.log("apiUrlAdvAcc or campaignId is missing", {
          apiUrlAdvAcc,
          campaignId,
        }); // Log to help debug
      }
    };

    fetchData();
  }, [apiUrlAdvAcc]);

  // const updatePreview = (text: string) => {
  //   const formattedText = text
  //     .replace(/\*(.*?)\*/g, "<b>$1</b>") // Bold
  //     .replace(/_(.*?)_/g, "<i>$1</i>") // Italics
  //     .replace(/~(.*?)~/g, "<del>$1</del>") // Strikethrough
  //     .replace(/`(.*?)`/g, "<code>$1</code>"); // Monospace

  //   setTemplatePreview(formattedText);
  // };

  const applyFormatting = (symbol: string) => {
    const textarea = document.querySelector("textarea") as HTMLTextAreaElement;

    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      // Get selected text
      const selectedText = bodyText.substring(start, end);

      // Wrap the selected text with the symbol
      const formattedText = `${symbol}${selectedText}${symbol}`;
      const updatedText =
        bodyText.substring(0, start) + formattedText + bodyText.substring(end);

      setBodyText(updatedText); // Update text in textarea
      //updatePreview(updatedText); // Update preview with formatting

      // Restore cursor position
      setTimeout(() => {
        textarea.selectionStart = start + symbol.length;
        textarea.selectionEnd = end + symbol.length;
        textarea.focus();
      }, 0);
    }
  };

  const makeTextBold = () => applyFormatting("*");
  const makeTextItalic = () => applyFormatting("_");
  const makeTextStrikethrough = () => applyFormatting("~");
  const makeTextMonospace = () => applyFormatting("```");

  const updateTemplatePreview = () => {
    let updatedText = bodyText
      // Match *text* for bold and replace with <b>text</b>
      .replace(/\*(.*?)\*/g, "<b>$1</b>") // Bold
      // Match _text_ for italic and replace with <i>text</i>
      .replace(/_(.*?)_/g, "<i>$1</i>") // Italics
      // Match ~text~ for strikethrough and replace with <del>text</del>
      .replace(/~(.*?)~/g, "<del>$1</del>") // Strikethrough
      // Match `text` for code formatting and replace with <code>text</code>
      .replace(/`(.*?)`/g, "<code>$1</code>"); // Monospace

    // Replace placeholders like {{1}}, {{2}} with actions from `boxes`
    const placeholderRegex = /{{(\d+)}}/g;
    updatedText = updatedText.replace(placeholderRegex, (match, p1) => {
      const index = parseInt(p1, 10) - 1; // Get the placeholder index
      // Replace with the corresponding action or keep the placeholder
      return boxes[index] && boxes[index].action ? boxes[index].action : match;
    });

    // Append footer if needed
    // updatedText += `\n\n${FooterText}`;

    // Update preview
    setTemplatePreview(updatedText);
  };

  const toLowerCase = (str: string): string => {
    return str
      .toLowerCase() // Convert to lowercase
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
        index === 0 ? word.toLowerCase() : word.toUpperCase()
      ) // Capitalize letters except the first
      .replace(/\s+/g, ""); // Remove spaces
  };

  const toCamelCase = (str: string): string => {
    return str
      .toLowerCase() // Convert the entire string to lowercase first
      .replace(
        /([-_][a-z])/g,
        (match) => match.toUpperCase().replace(/[-_]/g, "") // Capitalize after '-' or '_'
      )
      .replace(/^\w/, (match) => match.toUpperCase()); // Capitalize the first character
  };

  const base64ToFile = (
    base64: string,
    fileName: string,
    mime: string
  ): File => {
    // Split the base64 string to get the data
    const arr = base64.split(",");
    const byteString = atob(arr[1]);

    // Create a byte array
    const byteArray = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
      byteArray[i] = byteString.charCodeAt(i);
    }

    // Create a File object
    return new File([byteArray], fileName, { type: mime });
  };

  const simulateFileChangeEvent = (
    file: File
  ): React.ChangeEvent<HTMLInputElement> => {
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);

    const input = document.createElement("input");
    input.type = "file";
    input.files = dataTransfer.files;

    return {
      target: input,
      currentTarget: input,
      bubbles: false,
      cancelable: false,
      defaultPrevented: false,
      eventPhase: 0,
      isTrusted: true,
      nativeEvent: {} as Event,
      preventDefault: () => {},
      stopPropagation: () => {},
      persist: () => {},
      timeStamp: Date.now(),
      type: "change",
    } as unknown as React.ChangeEvent<HTMLInputElement>;
  };

  const isValidFile = (file: File) => {
    debugger;
    const fileType = file.type;

    if (selectedOption === "image" || HeaderSelectedOption === "image") {
      return fileType === "image/jpeg" || fileType === "image/png";
    }
    if (selectedOption === "video" || HeaderSelectedOption === "video") {
      return fileType.includes("video/");
    }
    if (selectedOption === "document" || HeaderSelectedOption === "document") {
      return fileType === "application/pdf"; // Allow only PDF
    }
    return false;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debugger;

    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      console.log("File Name:", file.name);
      console.log("File Length (in bytes):", file.size);
      console.log("File Type:", file.type);

      if (isValidFile(file)) {
        // setFileName(file.name);
        // setFileLength(file.size.toString());
        // setFileType(file.type);
        debugger;
        //uploadMedia(file);
        setSelectedFile(file);
      } else {
        alert("Invalid file type selected.");
        setSelectedFile(null);

        // Clear the input value
        // if (fileInputRef.current) {
        //   fileInputRef.current.value = "";
        // }
      }
    }
  };

  const handlePostComment = async () => {
    setLoading(true);
    try {
      const payload = {
        workspaceId: campaignWorkspaceId || 0,
        campaignId: campaignId,
        campaignName: campaignName,
        statusMark: "Unread",
        notificationType: "AdminComment",
        notificationData: {
          Message: "Admin Commented on your campaign " + campaignName,
          Comment: comment,
        },
        role: "Advertiser",
      };
      console.log("payload :", payload);
      const response = await axios.post(
        `${apiUrlAdvAcc}/CreateNotification`,
        payload
      );
      const Close = () => {
        setIsLoading(false);

        navigate("/adminNavbar/campaigns");
      };
      if (response.data.status === "Success") {
        toast.toast({
          title: "Success",
          description: "Comment Posted Successfully.",
        });
        setTimeout(() => {
          Close();
        }, 800);
      }
    } catch (e) {
      setLoading(false);
      console.log("Error :", e);
      toast.toast({
        title: "Error Occurred",
        description: "An unexpected error occurred. Please try again later.",
      });
    }
  };

  const handleUpdatePostComment = async () => {
    setLoading(true);
    try {
      const payload = {
        campaignId: campaignId,

        notificationData: {
          Message: "Admin Commented on your campaign " + campaignName,
          Comment: comment,
        },
      };
      console.log("payload :", payload);
      const response = await axios.put(
        `${apiUrlAdvAcc}/UpdateCommentNotification `,
        payload
      );
      const Close = () => {
        setIsLoading(false);

        navigate("/adminNavbar/campaigns");
      };
      if (response.data.status === "Success") {
        toast.toast({
          title: "Success",
          description: "Comment Posted Successfully.",
        });
        setTimeout(() => {
          Close();
        }, 800);
      }
    } catch (e) {
      setLoading(false);
      console.log("Error :", e);
      toast.toast({
        title: "Error Occurred",
        description: "An unexpected error occurred. Please try again later.",
      });
    }
  };

  const handleApproveNotification = async (campaignId: number) => {
    try {
      const payload = {
        workspaceId: campaignWorkspaceId || 0,
        campaignId,
        campaignName,
        statusMark: "Unread",
        notificationType: "AdminCampaignApprove",
        notificationData: {
          Message: `Admin approved your campaign- ${campaignName}`,
        },
        role: "Advertiser",
      };

      console.log("Notification payload:", payload);

      const response = await axios.post(
        `${apiUrlAdvAcc}/CreateNotification`,
        payload
      );

      if (response.data.status !== "Success") {
        throw new Error("Notification API failed.");
      }
    } catch (error) {
      console.error("Notification error:", error);
      toast.toast({
        title: "Notification Error",
        description: "Campaign approved but notification could not be sent.",
      });
    }
  };

  const handleRejectNotification = async (campaignId: number) => {
    try {
      const payload = {
        workspaceId: campaignWorkspaceId || 0,
        campaignId,
        campaignName,
        statusMark: "Unread",
        notificationType: "AdminCampaignApprove",
        notificationData: {
          Message: `Admin rejected your campaign- ${campaignName}`,
        },
        role: "Advertiser",
      };

      console.log("Notification payload:", payload);

      const response = await axios.post(
        `${apiUrlAdvAcc}/CreateNotification`,
        payload
      );

      if (response.data.status !== "Success") {
        throw new Error("Notification API failed.");
      }
    } catch (error) {
      console.error("Notification error:", error);
      toast.toast({
        title: "Notification Error",
        description: "Campaign rejected but notification could not be sent.",
      });
    }
  };

  const loadTemplateList = async (id: any) => {
    debugger;
    setIsLoading(true);
    console.log("templateId API::", id);

    try {
      const response = await axios.get(
        `${apiUrlAdvAcc}/GetMetaTemplateDetailsById?template_id=` + id
      );
      console.log(
        "response.data.templateDetails:" + response.data.templateDetails
      );
      if (response.data && response.data.templateDetails) {
        setIsLoading(false);
        const templateDetailslocal = response.data.templateDetails[0];

        console.log("Template List By Id:", templateDetailslocal);
        const components = JSON.parse(templateDetailslocal.components);
        console.log("Components : " + JSON.stringify(components));

        // setTemplateName(templateDetailslocal.template_name);
        // setUpdateChannel(templateDetailslocal.channel_type);
        // setUpdateLanguage(templateDetailslocal.language);

        if (templateDetailslocal.channel_id === 2) {
          const body = templateDetailslocal.message_content;
          if (body) {
            setBodyText(body);
            console.log("Body Text :" +body);
          }
        }
        const header = components.find(
          (item: { type: string }) => item.type === "HEADER"
        );
        if (header && header.format) {
          debugger;
          HeaderSelectedOption = toLowerCase(header.format);
          setSelectedOption(toLowerCase(header.format));
          setUpdateHeaderType(toCamelCase(header.format));

          if (header.format == "TEXT") {
            setTextInput(header.text);
            headerText = header.text;
            console.log("Header Text : " + textInput);
          }
          if (
            header.format === "IMAGE" ||
            header.format === "VIDEO" ||
            header.format === "DOCUMENT"
          ) {
            debugger;
            console.log("Header Format: " + selectedOption);

            const formatToMime = {
              IMAGE: { mime: "image/png", extension: ".png" },
              VIDEO: { mime: "video/mp4", extension: ".mp4" },
              DOCUMENT: { mime: "application/pdf", extension: ".pdf" },
            };

            const formatDetails =
              formatToMime[header.format as keyof typeof formatToMime];
            const base64String = templateDetailslocal.mediaBase64;
            const fileName = `uploaded_file${formatDetails.extension}`;

            const file = base64ToFile(
              base64String,
              fileName,
              formatDetails.mime
            );

            const event = simulateFileChangeEvent(file);

            handleFileChange(event);
          }
        }

          const body = components.find(
            (item: { type: string }) => item.type === "BODY"
          );

          if (body) {
            setBodyText(body.text);
            console.log("Body Text :" + body.text);

            // Check if body.example.body_text exists and has content
            if (
              body.example &&
              body.example.body_text &&
              body.example.body_text.length > 0
            ) {
              const transformedData: BoxItem[] = body.example.body_text.map(
                (text: string) => ({ action: text })
              );

              setBoxes(transformedData);

              console.log("Body text variable : " + body.example.body_text);
            } else {
              console.log("No example body_text available.");
            }
          }

          const footer = components.find(
            (item: { type: string }) => item.type === "FOOTER"
          );

          if (footer) {
            setFooterText(footer.text);
            console.log("Footer Text :" + footer.text);
          }

          const buttons = components.find(
            (item: { type: string }) => item.type === "BUTTONS"
          );

          if (buttons) {
            console.log("Button values :" + buttons.buttons.length);
            const updatedRows = [...rows];
            const updatedButtonIds = [...selectedButtonIds]; // Create a new array to store button IDs
            buttons.buttons.forEach((button: any, i: number) => {
              if (button.type === "URL") {
                console.log("Button type : " + button.type);
                updatedRows[i] = {
                  buttonType: "View Website",
                  buttonText: button.text,
                  websiteUrl: button.url,
                  buttonTypeDropdown: "static",
                  countryCode: "",
                  callPhoneNumber: "",
                  copyOfferCode: "",
                };
                updatedButtonIds[i] = "View Website"; // Update buttonType in selectedButtonIds
              } else if (button.type === "PHONE_NUMBER") {
                console.log("Button type : " + button.type);

                // Extract country code and phone number using regex
                const phoneNumberMatch =
                  button.phone_number.match(/^(\+\d{1,2})(\d+)$/); // Match +countryCode and the rest of the number

                let countryCode = "";
                let callPhoneNumber = "";

                if (phoneNumberMatch) {
                  countryCode = phoneNumberMatch[1].replace("+", ""); // Remove '+' sign, e.g., +91 -> 91
                  callPhoneNumber = phoneNumberMatch[2]; // Get the remaining number
                }

                // Update row values
                updatedRows[i] = {
                  buttonType: "Call Phone Number",
                  buttonText: button.text,
                  websiteUrl: "",
                  buttonTypeDropdown: "static",
                  countryCode: countryCode, // Assign extracted country code
                  callPhoneNumber: callPhoneNumber, // Assign extracted phone number
                  copyOfferCode: "",
                };

                // Update buttonType in selectedButtonIds
                updatedButtonIds[i] = "Call Phone Number";

                console.log("Country Code:", countryCode);
                console.log("Call Phone Number:", callPhoneNumber);
              }
              if (button.type === "COPY_CODE") {
                console.log("Button type : " + button.type);
                updatedRows[i] = {
                  buttonType: "Copy Offer Code",
                  buttonText: button.text,
                  websiteUrl: "",
                  buttonTypeDropdown: "",
                  countryCode: "",
                  callPhoneNumber: "",
                  copyOfferCode: button.example[0],
                };
                updatedButtonIds[i] = "Copy Offer Code"; // Update buttonType in selectedButtonIds
              }
            });
            setRows(() => updatedRows);
            setSelectedButtonIds(updatedButtonIds); // Update selectedButtonIds state
            console.log("Updated Rows : ", updatedRows);
            console.log("Updated Button IDs : ", updatedButtonIds);
          
        }
      } else {
        setIsLoading(false);
        console.log("No Templates details available in response.");
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Error fetching template details:", error);
    } finally {
      setLoading(false);
    }
  };

  const textAreaIcon = () => {
    return (
      <div className="relative w-8 h-8 flex justify-center items-center">
        <div
          className="absolute rounded w-[3px] h-8 transform rotate-45"
          style={{ borderLeft: "3px solid #64748B" }}
        />
        <div
          className="absolute w-[3px] h-4 rounded transform rotate-45 translate-x-2 translate-y-2"
          style={{ borderLeft: "3px solid #64748B" }}
        />
      </div>
    );
  };

  const renderPreview = () => {
    // Check if any content is available for the body or footer
    const isBodyEmpty = !bodyText?.trim();
    const isFooterEmpty = !FooterText?.trim();
    const isbuttonTextEmpty = !buttonText?.trim();
    const noContentSelected =
      !selectedOption &&
      !selectedFile &&
      isBodyEmpty &&
      isFooterEmpty &&
      rows.length === 0;

    return (
<div
  className={`flex rounded-[20px] flex-col justify-between w-full max-h-fit bottom-0 ${
    channel.toString() === "2" ? "bg-gray-200" : "bg-gray-200"
  }`}
  style={
    channel.toString() === "5"
      ? {
          backgroundImage: `url(${Default_WhatsApp_background})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
        }
      : undefined
  }
>
        {noContentSelected ? (
          <div className="flex w-full h-[calc(100vh-200px)] items-center justify-center">
            <div className="text-center">
              <div>{textAreaIcon()}</div>
              <div className="mt-6">
                <p className="text-xl font-semibold">Mobile screen</p>
              </div>
              <div
                className="w-[125px] mt-2"
                style={{ fontWeight: 500, fontSize: "14px" }}
              >
                <p>Preview varies based on platform selection</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Image, Video, or Document Preview */}
            <div className="flex justify-center">
              {selectedOption === "image" && selectedFile && (
                <img
                  src={URL.createObjectURL(selectedFile!)}
                  alt="Preview"
                  className="w-[320px] h-[200px] object-cover mx-auto"
                />
              )}
              {selectedOption === "video" && selectedFile && (
                <video
                  controls
                  className="w-[320px] h-[200px] object-cover mx-auto"
                >
                  <source src={URL.createObjectURL(selectedFile)} />
                </video>
              )}
              {selectedOption === "document" && selectedFile && (
                <div className="w-[320px] h-[200px] mx-auto border">
                  {selectedFile.type === "application/pdf" ? (
                    <iframe
                      src={URL.createObjectURL(selectedFile)}
                      className="w-full h-full no-scrollbar"
                      style={{
                        overflow: "hidden",
                        overflowX: "hidden",
                        overflowY: "hidden",
                      }}
                      title="PDF Preview"
                    />
                  ) : (
                    <p className="text-center text-gray-600 mt-8">
                      Cannot preview this document. Download:{" "}
                      <a
                        href={URL.createObjectURL(selectedFile)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline"
                      >
                        {selectedFile.name}
                      </a>
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Body Text */}
            <div className="flex-1 text-black w-full text-left">
              {selectedOption === "text" && textInput && (
                <p
                  className="w-full text-base font-sans p-2 font-bold"
                  style={{
                    whiteSpace: "pre-wrap", // Preserve newlines and spaces
                    wordWrap: "break-word", // Break long words
                  }}
                >
                  {textInput}
                </p>
              )}
              {!isBodyEmpty ? (
                <p
                  className="text-base font-sans p-2"
                  style={{
                    whiteSpace: "pre-wrap", // Preserve formatting
                    wordWrap: "break-word", // Handle long words
                  }}
                >
                  <div
                    className="w-full  rounded p-2  mt-4 min-h-fit"
                    dangerouslySetInnerHTML={{ __html: templatePreview }}
                  ></div>
                </p>
              ) : (
                <p className="text-base font-medium"></p>
              )}
            </div>

            {/* Footer Text */}
            <div className="border-t mt-2 pt-2 text-center">
              {!isFooterEmpty ? (
                <p
                  className="font-semibold text-black"
                  style={{ fontSize: "14px" }}
                >
                  {FooterText}
                </p>
              ) : (
                <p className="text-sm text-gray-500"></p>
              )}
            </div>

            {/* WebURL */}
            {/* <div className="border-t mt-2 pt-2 text-center">
            {!isbuttonTextEmpty ? (
              <p className="font-serif text-blue-400"><a href={websiteUrl} target="_blank" rel="noopener noreferrer">
              {buttonText}
            </a></p>
            ) : (
              <p className="text-sm text-gray-500"> </p>
            )}
          </div> */}

            {/* Buttons Preview */}

            <div className="border-t mt-2 pt-2 text-center">
              {rows.map((row, index) => (
                <p
                  key={index}
                  className="font-serif text-blue-400"
                  style={{ fontSize: "14px" }}
                >
                  <a
                    href={row.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {row.buttonText}
                    <div className=""></div>
                  </a>
                </p>
              ))}
            </div>
            {/* <div className="border-t mt-2"></div> */}
          </>
        )}
      </div>
    );
  };

  const UpdateCampaignStatusApprove = async (campaignId: number) => {
    debugger
    setIsLoading(true);

    // if (!validateSmsServer(smsServer)) {
    //   setIsLoading(false);
    //   return;
    // }

    try {
      const data = {
        campaignId,
        status: "Approved",
        // serverId: smsServer,
        // connectionId: smsConnection,
        campaignWorkspaceId: campaignWorkspaceId,
        Campaignname: campaignName,
      };

      const response = await axios.put(
        `${adminapiUrlAdvAcc}/UpdateCampaignStatus`,
        data
      );
      debugger;
      const Close = () => {
        setIsLoading(false);
        dispatch(SetCampaignInReviewCount(CampaignInReviewCount - 1));
        navigate("/adminNavbar/campaigns");
      };

      if (response.data.status === "Success") {
        dispatch(SetCampaignInReviewCount(CampaignInReviewCount - 1));

        await handleApproveNotification(campaignId);

        toast.toast({
          title: "Campaign Approved",
          description: `${campaignName} has been approved and notification sent.`,
        });

        setIsLoading(false);
        setTimeout(() => {
          Close();
        }, 800);
      } else {
        setIsLoading(false);
        Close();
        toast.toast({
          title: "Error",
          description: "Error in approving campaign status",
        });
      }
    } catch (e) {
      setIsLoading(false);
      console.log("Error");
    }
  };

  const UpdateCampaignStatusReject = async (campaignId: number) => {
    setIsLoading(true);
    try {
      const data = {
        campaignname:campaignName,
        campaignId: campaignId,
        status: "Rejected",
      };

      const response = await axios.put(
        `${adminapiUrlAdvAcc}/UpdateCampaignStatus`,
        data
      );

      const Close = () => {
        setIsLoading(false);
        dispatch(SetCampaignInReviewCount(CampaignInReviewCount - 1));
        navigate("/adminNavbar/campaigns");
      };

      if (response.data.status === "Success") {
        dispatch(SetCampaignInReviewCount(CampaignInReviewCount - 1));

        await handleRejectNotification(campaignId);

        Close();

        toast.toast({
          title: "Campaign Rejected",
          description: `${campaignName} has been rejected and notification sent.`,
        });
      } else {
        Close();

        toast.toast({
          title: "Error",
          description: "Error in rejecting campaign",
        });
      }
    } catch (e) {
      console.log("Error");
    }
  };

  // const getConnectionList = async (serverId: number) => {
  //   //setIsLoading(true);
  //   try {
  //     const response = await axios.get(
  //       `${smsUrl}/getconnections?ServerId=${serverId}`
  //     );
  //     if (response.data.status === "Success") {
  //       //setConnectionList(response.data.connectionList);
  //       // response.data.connectionList.forEach((connection: ServerList) => {
  //       //   checkIsAlive(serverId, connection.id);
  //       // });
  //       setSmsConnectionList(response.data.connectionList);
  //     } else {
  //       console.error("List of connections not found");
  //     }
  //   } catch (error) {
  //     console.error("Error getting connection list: ", error);
  //   }
  //   //setIsLoading(false);
  // };

  const handleCampaignNameChange = (value: string) => {
    setCampaignName(value);
    validateCampaignName();
  };

  const handleChannelChange = (value: string) => {
    setChannel(value);
    validateChannel(value); // Pass the updated value for validation
  };

  const handleSmsServerChange = (value: number) => {
    setSmsServer(value);
    validateSmsServer(value); // Pass the updated value for validation
   // getConnectionList(value);
  };

  const handleSmsConnectionChange = (value: number) => {
    debugger
    setSmsConnection(value);
    validateSmsConnection(value); // Pass the updated value for validation
  };

  const handleTemplateChange = (value: string) => {
    setTemplate(value);
    validateTemplate(value); // Pass the updated value for validation
  };

  const handleAudienceChange = (value: string) => {
    setAudience(value);
  };

  const handleReachPeopleFromChange = (values: string[]) => {
    setReachPeopleFrom(values);
    validateFromCountry(values); // Pass the updated values for validation
  };

  const handleReachPeopleInChange = (values: string[]) => {
    setReachPeopleIn(values);
    validateInCountry(values); // Pass the updated values for validation
  };

  const handleCampaignBudgetChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCampaignBudget(e.target.value);
    validateBudget();
  };

  const handleFCampaignBudgetChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFCampaignBudget(e.target.value);
    validateFBudget();
  };

  const handleStartDateValidateChange = (date: Date) => {
    if (date < currentDate) {
      setStartDateError("Start date must be greater than or equal to today.");
    } else {
      setStartDateError(null);
    }
  };

  // Validate end date
  const handleEndDateValidateChange = (date: Date) => {
    if (date < currentDate) {
      setEndDateError("End date must be greater than or equal to today.");
    } else if (new Date(campaignStartDate) > date) {
      setEndDateError("End date must be after the start date.");
    } else {
      setEndDateError(null);
    }
  };

  const validateCampaignName = (): boolean => {
    if (!campaignName.trim()) {
      setCampaignNameError("Campaign name is required");
      return false;
    }
    setCampaignNameError(null);
    return true;
  };

  const validateChannel = (value: string): boolean => {
    if (!value) {
      setChannelError("Please select a channel");
      return false;
    }
    setChannelError(null);
    return true;
  };

  const validateSmsServer = (value: number | undefined): boolean => {
    if (updateChannel === "SMS") {
      if (!value) {
        setSmsServerError("Please select a Server");
        toast.toast({
          title: "Warning",
          description: "Please select a server",
        });
        return false;
      }
    }

    setSmsServerError(null);
    return true;
  };

  const validateSmsConnection = (value: number | undefined): boolean => {
    if (updateChannel === "SMS") {
      if (!value) {
        setSmsConnectionError("Please select a Connection");
        toast.toast({
          title: "Warning",
          description: "Please select a Connection",
        });
        return false;
      }
    }

    setSmsConnectionError(null);
    return true;
  };

  const validateTemplate = (value: string): boolean => {
    if (!value) {
      setTemplateError("Please select a template");
      return false;
    }
    setTemplateError(null);
    return true;
  };

  const validateFromCountry = (values: string[]): boolean => {
    if (!values.length) {
      setTargetCountryError("Please select a country");
      return false;
    }
    setTargetCountryError(null);
    return true;
  };

  const validateInCountry = (values: string[]): boolean => {
    if (!values.length) {
      setRoamingCountryError("Please select a country");
      return false;
    }
    setRoamingCountryError(null);
    return true;
  };

  const validateBudget = (): boolean => {
    const parsedBudget = parseFloat(campaignBudget);
    if (!campaignBudget || isNaN(parsedBudget) || parsedBudget <= 0) {
      setBudgetError("Please enter a valid campaign budget");
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

  const validateDates = (): boolean => {
    let isValid = true;

    if (!campaignStartDate) {
      setStartDateError("Start date is required");
      isValid = false;
    } else {
      setStartDateError(null);
    }

    if (!campaignEndDate) {
      setEndDateError("End date is required");
      isValid = false;
    } else if (new Date(campaignEndDate) < new Date(campaignStartDate)) {
      setEndDateError("End date cannot be earlier than start date");
      isValid = false;
    } else {
      setEndDateError(null);
    }

    if (!FcampaignStartDate) {
      setFStartDateError("Start date is required");
      isValid = false;
    } else {
      setFStartDateError(null);
    }

    if (!FcampaignEndDate) {
      setFEndDateError("End date is required");
      isValid = false;
    } else if (new Date(FcampaignEndDate) < new Date(FcampaignStartDate)) {
      setFEndDateError("End date cannot be earlier than start date");
      isValid = false;
    } else {
      setFEndDateError(null);
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
      setLoading(false);
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
      setLoading(false);
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
      setLoading(false);
    }
  };

  const getAudienceList = async () => {
    try {
      const response = await axios.get(
        `${apiUrlAdvAcc}/GetAdvAudienceListDetailsByWorkspaceId?workspace_id=${workspaceId}`
      );
      if (response.data.status === "Success") {
        setAudienceList(response.data.audienceList);
        console.log("audience list: ", response.data.audienceList);
      } else {
        console.error("No audience list found for workspace");
      }
    } catch (error) {
      console.error("Error calling audience list api: " + error);
    }
  };

  //   const getTemplateList = async () => {
  //     setLoading(true);

  //     try {
  //       const response = await axios.get(
  //         `${apiUrlAdvAcc}/GetMetaTemplateDetails?workspace_id=${workspaceId}`
  //       );

  //       if (response.data && response.data.templateDetails) {
  //         setTemplateList(response.data.templateDetails);
  //         console.log(response.data.templateDetails);
  //       } else {
  //         console.log("No template list available in response.");
  //       }
  //     } catch (error) {
  //       // Handle error if API call fails

  //       console.error("Error fetching template list:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  const getChannelList = async () => {
    setLoading(true);

    try {
      const response = await axios.get(`${apiUrlAdvAcc}/GetChannelList`);

      if (response.data && response.data.channelList) {
        setChannelList(response.data.channelList);
        console.log("Channel List : ", response.data.channelList);
      } else {
        console.log("No channel list available in response.");
      }
    } catch (error) {
      // Handle error if API call fails

      console.error("Error fetching country list:", error);
    } finally {
      setLoading(false);
    }
  };

  const getAgeList = async () => {
    setLoading(true);

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
    } finally {
      setLoading(false);
    }
  };

  const getGenderList = async () => {
    setLoading(true);

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
    } finally {
      setLoading(false);
    }
  };

  const GetIncomeLevelList = async () => {
    setLoading(true);

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
    } finally {
      setLoading(false);
    }
  };

  const GetLocationList = async () => {
    setLoading(true);

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
    } finally {
      setLoading(false);
    }
  };

  const GetInterestList = async () => {
    setLoading(true);

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
    } finally {
      setLoading(false);
    }
  };

  const GetBehaviourList = async () => {
    setLoading(true);

    try {
      const response = await axios.get(`${apiUrlAdvAcc}/GetBehaviourList`);

      if (response.data && response.data.behaviourList) {
        setBehaviourList(response.data.behaviourList);
        console.log("Behaviour List : ", response.data.behaviourList);
      } else {
        console.log("No Behaviour List available in response.");
      }
    } catch (error) {
      // Handle error if API call fails

      console.error("Error fetching Behaviour list:", error);
    } finally {
      setLoading(false);
    }
  };

  const GetDeviceList = async () => {
    setLoading(true);

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
    } finally {
      setLoading(false);
    }
  };

  const GetOSDeviceList = async () => {
    setLoading(true);

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
    } finally {
      setLoading(false);
    }
  };

  const GetAdminApprovalStatus = async (campaignId: number) => {
    debugger;
    setLoading(true);
    try {
      const response = await axios.get(
        `${adminapiUrlAdvAcc}/GetAdminApprovalStatus?CampaignId=${campaignId}`
      );
      if (response.data.IsApproved) {
        setCampaignApprovalStatus(response.data.isApproved);
      } else {
        setCampaignApprovalStatus(response.data.isApproved);
      }
    } catch (e) {
      console.log("Error in campaign Approval :" + e);
    }
  };

  const loadCampaignList = async (id: any) => {
    setIsLoading(true);

    try {
      const response = await axios.get(
        `${apiUrlAdvAcc}/GetCampaignDetailsById?CampaignId=` + id
      );

      if (response.data && response.data.campaignDetails) {
        setIsLoading(false);
        const campaignDetailslocal = response.data.campaignDetails[0];
        // debugger;
        console.log("Campaign List By Id:", campaignDetailslocal);

        templateId = campaignDetailslocal.template_id;

        setCampaignName(campaignDetailslocal.campaign_name);

        setCampaignBudget(campaignDetailslocal.campaign_budget); // Set other fields as needed
        setUpdateChannel(campaignDetailslocal.channel_type);
        setUpdateTemplate(campaignDetailslocal.template_name);
        setUpdateCountry(campaignDetailslocal.target_country);
        console.log("Target Country :-" + updateCountry);
        setUpdateRoamingCountry(campaignDetailslocal.roaming_country);
        console.log("Roaming Country :-" + updateRoamingCountry);
        setApprovedServerId(campaignDetailslocal.smpp_id);
      //  getConnectionList(campaignDetailslocal.smpp_id);
        setApprovedSmsConnectionId(campaignDetailslocal.sms_connection_id);

        debugger;
        // Extract and set admin comment
        try {
          const parsedComment = JSON.parse(campaignDetailslocal.comment);

          // Accessing the "Comment" key with a space
          if (parsedComment && parsedComment["Comment"]) {
            setComment(parsedComment["Comment"]);
            if (parsedComment["Comment"].length > 0) {
              SetUpdateComment(true);
            } else {
              SetUpdateComment(false);
            }
          } else {
            console.log("No valid comment found in parsedComment");
          }
        } catch (e) {
          console.warn("Failed to parse comment JSON:", e);
        }

        debugger;


        // Format and set the start date using handleDateChange
        const formattedStartDate =
          campaignDetailslocal.start_date_time.split("T")[0];
        handleStartDateChange(new Date(formattedStartDate)); // Call handleDateChange for the start date

        // Format and set the end date using handleDateChange
        const formattedEndDate =
          campaignDetailslocal.end_date_time.split("T")[0];
        handleEndDateChange(new Date(formattedEndDate)); // Call handleDateChange for the end date
      } else {
        console.log("No campaign details available in response.");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error fetching campaign details:", error);
      setIsLoading(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (
      smppServers.length > 0 &&
      campaignApprovalStatus &&
      approvedServerId > 0 &&
      smsConnectionList.length > 0 &&
      approvedSmsConnectionId > 0
    ) {
      console.log("Smpp Servers: ", smppServers);
      const selectedServer = smppServers.find(
        (server) => server.serverId === approvedServerId
      );
      if (selectedServer) {
        setSmsServer(selectedServer.serverId);
      }
      const selectedSmsConnection = smsConnectionList.find(
        (connection) => connection.id === approvedSmsConnectionId
      );
      if (selectedSmsConnection) {
        setSmsConnection(selectedSmsConnection.id);
      }
    }
  }, [approvedServerId, approvedSmsConnectionId,smppServers, campaignApprovalStatus]);

  const loadSmppServerList = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${smsUrl}/getservers`);
      if (response.data.status === "Success") {
        debugger;
        setIsLoading(false);
        const smppServerList = response.data.serverList;
        setSmppServers(response.data.serverList);
        console.log("servers : " + smppServers);
      } else {
        console.log("No smpp server list available in response.");
        setIsLoading(false);
      }
    } catch (e) {
      console.log("No smpp server list available in response.", e);
      setIsLoading(false);
    }
  };

  const isRussiaOrKazakhstanSelected = (): boolean => {
    const russiaId = targetCountryList.find(
      (country) => country.country_name === "Russia"
    )?.country_id;
    const kazakhstanId = targetCountryList.find(
      (country) => country.country_name === "Kazakhstan"
    )?.country_id;

    const isRussiaSelected =
      !!russiaId && reachPeopleFrom.includes(russiaId.toString());
    const isKazakhstanSelected =
      !!kazakhstanId && reachPeopleFrom.includes(kazakhstanId.toString());

    // Return true if either Russia or Kazakhstan is selected, but not both
    return isRussiaSelected !== isKazakhstanSelected; // XOR condition
  };

  useEffect(() => {
    setShowRussiaAndKazakhstan(!!isRussiaOrKazakhstanSelected());
  }, [reachPeopleFrom, targetCountryList]);

  const channelFilter = (channelTemplate: any) => {
    console.log("Channel : " + channelTemplate);

    const channelFilterId = channelList.find(
      (cid) => cid.channel_id === channelTemplate
    );
    const channelFilterName = channelFilterId
      ? channelFilterId.channel_name
      : "";

    const templatefilterlist1 = templateList.filter(
      (tname) => tname.channel_type === channelFilterName
    );
    setTemplatefilterlist(templatefilterlist1);

    console.log("Filter list : " + templatefilterlist);
  };

  // const getTemplateChannel = () => {
  //   const findchannel = templateList.find(
  //     (findtemplate) => findtemplate.template_id === parseInt(template)
  //   );
  //   const channelType = findchannel ? findchannel.channel_type : "";
  //   setChannel(channelType);
  // };

  // useEffect(() => {
  //   getTemplateChannel();
  // }, [template]);

  const getCurrentDateTime = () => {
    const now = new Date();
    return format(now, "MMM dd, yyyy 'at' HH:mm"); // Example: Dec 30, 2024 at 07:55
  };

  return (
    <>
      <Toaster />
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-[500px]">
          <CircularProgress color="success" />
        </div>
      ) : (
        <div className="overflow-y-auto ml-[-7px]">
          <Toaster />
          <div className="fixed flex justify-end gap-4 mr-[40px] items-end right-[0px] top-[-15px] z-20 ">
            {campaignStatus !== "Live" &&
              campaignStatus !== "Rejected" &&
              campaignApprovalStatus == false && (
                <Button
                  variant={"outline"}
                  className="w-[80px] border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                  onClick={() => {
                    UpdateCampaignStatusReject(campaignId); // Call handleSubmit if campaignId does not exist

                    console.log("Clicked"); // Log the click event
                  }}
                >
                  Reject
                </Button>
              )}
            {campaignStatus !== "Live" &&
            campaignStatus !== "Rejected" &&
            !campaignApprovalStatus ? (
              <Button
                className="w-[80px] text-[#F8FAFC] form-button"
                onClick={() => {
                  UpdateCampaignStatusApprove(campaignId);
                  console.log("Clicked");
                }}
              >
                Approve
              </Button>
            ) : (
              <Button
                className="w-[80px] text-[#F8FAFC]"
                onClick={() => {
                  navigate("/adminNavbar/campaigns");
                  console.log("Clicked");
                }}
              >
                Back
              </Button>
            )}
          </div>
          <div className="gap-4 flex ">
            <div className="ml-4">
              <Card className="w-[580px] h-flex-grow p-4 shadow-sm mb-[150px]">
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
                      onChange={(e) => handleCampaignNameChange(e.target.value)}
                      className="mt-2 text-[#64748B] text-sm font-normal"
                      disabled
                    />
                    {campaignNameError && (
                      <p className="text-red-500 text-sm">
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
                      }}
                    >
                      <SelectTrigger disabled className="text-gray-500 mt-2">
                        <SelectValue
                          className="text-[#64748B] text-sm font-normal"
                          placeholder={
                            campaignId
                              ? updateChannel
                              : "Select your campaign channel"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {channelList
                          .filter(
                            (channel) =>
                              channel.channel_name.toLowerCase() === "whatsapp"
                          ) // Filter WhatsApp channel
                          .map((channel) => (
                            <SelectItem
                              className="text-[#64748B] text-sm font-normal"
                              key={channel.channel_id}
                              value={channel.channel_id as any}
                            >
                              {channel.channel_name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>

                    {channelError && (
                      <p className="text-red-500 text-sm">{channelError}</p>
                    )}
                  </div>

                  {/* {channelName === "SMS" && (
                    <div className="mt-4">
                      <Label
                        htmlFor="SmsServer"
                        className="mt-2 font-medium text-[#020617]"
                        style={{ fontSize: "14px" }}
                      >
                        SMPP Server
                      </Label>
                      <Select
                        value={smsServer?.toString()}
                        onValueChange={(value) => {
                          handleSmsServerChange(Number(value));
                          console.log("Selected Server ID:", value);
                        }}
                        disabled={campaignApprovalStatus}
                      >
                        <SelectTrigger className="text-gray-500 mt-2">
                          <SelectValue
                            className="text-[#64748B] text-sm font-normal"
                            placeholder={"Select a SMS Server"}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {smppServers.map((server) => (
                            <SelectItem
                              key={server.serverId}
                              value={server.serverId.toString()}
                              className="text-[#64748B] text-sm font-normal"
                            >
                              {server.serverName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {smsServerError && (
                        <p className="text-red-500 text-sm">{smsServerError}</p>
                      )}
                    </div>
                  )}

                  {channelName === "SMS" && (
                    <div className="mt-4">
                      <Label
                        htmlFor="connections"
                        className="mt-2 font-medium text-[#020617]"
                        style={{ fontSize: "14px" }}
                      >
                        Connections
                      </Label>
                      <Select
                        value={smsConnection?.toString()}
                        onValueChange={(value) => {
                          handleSmsConnectionChange(Number(value));
                          console.log("Selected Connection ID:", value);
                        }}
                        disabled={campaignApprovalStatus}
                      >
                        <SelectTrigger className="text-gray-500 mt-2">
                          <SelectValue
                            className="text-[#64748B] text-sm font-normal"
                            placeholder={"Select a SMS Server"}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {smsConnectionList.map((connection) => (
                            <SelectItem
                              key={connection.id}
                              value={connection.id.toString()}
                              className="text-[#64748B] text-sm font-normal"
                            >
                              {connection.channelName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {smsConnectionError && (
                        <p className="text-red-500 text-sm">
                          {smsConnectionError}
                        </p>
                      )}
                    </div>
                  )} */}

                  {/* Reach people from */}
                  {/* {updateCountry && updateCountry.trim().length > 0 && (
                    <div className="mt-4">
                      <Label
                        htmlFor="reachPeopleFrom"
                        className="mt-2 text-sm font-medium text-[#020617]"
                      >
                        Reach people from
                      </Label>
                      <MultiSelect
                        disabled
                        className="text-[#64748B] text-sm font-normal mt-1 overflow-hidden"
                        options={targetCountryList.map((country) => ({
                          label: country.country_name,
                          value: country.country_id.toString(),
                        }))}
                        onValueChange={(values) => {
                          console.log("Selected Country IDs:", values);
                          handleReachPeopleFromChange(values);
                        }}
                        value={reachPeopleFrom}
                        placeholder={
                          reachPeopleFrom.length === 0 ? updateCountry : ""
                        }
                        maxCount={3}
                        variant="inverted"
                      />
                      {targetCountryError && (
                        <p className="text-red-500 text-sm">
                          {targetCountryError}
                        </p>
                      )}
                    </div>
                  )} */}

                  {/* Reach people traveling to */}
                  {/* {updateRoamingCountry &&
                    updateRoamingCountry.trim().length > 0 && (
                      <div className="mt-4">
                        <Label
                          htmlFor="reachPeopleIn"
                          className="mt-2 text-sm font-medium text-[#020617]"
                        >
                          Reach people traveling to
                        </Label>
                        <MultiSelect
                          disabled
                          className="text-[#64748B] text-sm font-normal mt-1"
                          options={roamingCountryList.map((country) => ({
                            label: country.country_name,
                            value: country.country_id.toString(),
                          }))}
                          onValueChange={(values) => {
                            console.log("Selected Country IDs:", values);
                            handleReachPeopleInChange(values);
                          }}
                          value={reachPeopleIn}
                          placeholder={
                            reachPeopleIn.length === 0
                              ? updateRoamingCountry
                              : ""
                          }
                          maxCount={3}
                          variant="inverted"
                        />
                        {roamingCountryError && (
                          <p className="text-red-500 text-sm">
                            {roamingCountryError}
                          </p>
                        )}
                      </div>
                    )} */}

                  <div className="mt-4">
                    <Label
                      htmlFor="campaignStartDate"
                      className="mt-2 text-sm font-normal text-[#020617]"
                    >
                      Campaign start date
                    </Label>
                    <div className="relative mt-2 text-[#64748B] text-sm font-normal">
                      <input
                        disabled
                        id="campaignStartDate"
                        type="text"
                        value={campaignStartDate}
                        onChange={(e) => setCampaignStartDate(e.target.value)}
                        onBlur={() =>
                          handleStartDateChange(
                            new Date(
                              campaignStartDate.split("/").reverse().join("-")
                            )
                          )
                        }
                        placeholder="dd/mm/yyyy"
                        style={{ fontSize: "14px" }}
                        className="w-full p-2 border border-gray-300 rounded text-[#64748B] text-sm font-normal"
                      />
                      {startdateError && (
                        <p className="text-red-500 text-sm">{startdateError}</p>
                      )}
                      <Popover
                        open={isStartCalendarOpen}
                        onOpenChange={setStartCalendarOpen}
                      >
                        <PopoverTrigger disabled asChild>
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
                            onSelect={handleStartDateChange}
                            disabled={(date: Date) => isStartDateDisabled(date)} // Disable dates before today
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Label
                      htmlFor="campaignEndDate"
                      className="mt-2 text-sm font-normal text-[#020617]"
                    >
                      Campaign end date
                    </Label>
                    <div className="relative mt-2 text-[#64748B] text-sm font-normal">
                      <input
                        disabled
                        id="campaignEndDate"
                        type="text"
                        value={campaignEndDate}
                        onChange={(e) => setCampaignEndDate(e.target.value)}
                        onBlur={() =>
                          handleEndDateChange(
                            new Date(
                              campaignEndDate.split("/").reverse().join("-")
                            )
                          )
                        }
                        placeholder="dd/mm/yyyy"
                        style={{ fontSize: "14px" }}
                        className="w-full p-2 border border-gray-300 rounded text-[#64748B] text-sm font-normal"
                      />
                      {enddateError && (
                        <p className="text-red-500 text-sm">{enddateError}</p>
                      )}
                      <Popover
                        open={isEndCalendarOpen}
                        onOpenChange={setEndCalendarOpen}
                      >
                        <PopoverTrigger disabled asChild>
                          <button className="absolute right-2 top-1/2 transform -translate-y-1/2">
                            <CalendarIcon className="text-gray-500" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent>
                          <Calendar
                            mode="single"
                            selected={
                              campaignEndDate
                                ? new Date(
                                    campaignEndDate
                                      .split("/")
                                      .reverse()
                                      .join("-")
                                  )
                                : undefined
                            }
                            onSelect={handleEndDateChange}
                            disabled={(date: Date) => isEndDateDisabled(date)} // Disable dates before start date
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
        
            <div className="mt-4">
                    <Label
                      htmlFor="postComment"
                      className="mt-2 text-sm font-normal text-[#020617]"
                    >
                      Post Comment
                    </Label>
                    <div className="relative mt-2 text-[#64748B] text-sm font-normal">
                      <textarea
                        id="postComment"
                        name="postComment"
                        className="w-full min-h-[100px] rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Write your comment here..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                      />
                    </div>
                    <div className="mt-[] flex justify-end">
                      <Button
                        onClick={
                          updateComment
                            ? handleUpdatePostComment
                            : handlePostComment
                        }
                        disabled={isLoading}
                        className="mt-[] w-[25vh] form-button"
                      >
                        Post Comment
                      </Button>
                    </div>
                  </div>
                  </div>

</Card>

</div>
            
           

            <div
              className={`border justify-items-center pl-7 pr-7 max-h-fit top-auto right-14 rounded-lg`}
            >
              <h2 className="mb-2 mt-4 ml-[-200px] font-bold">
                Message preview
              </h2>
              <div
                className="flex flex-col justify-between rounded-[30px] text-black p-4 w-[350px] min-h-auto"
                style={{ backgroundColor: "#f9f9f9" }}
              >
                <div className="justify-center">
                  <i className="fas fa-mobile-alt text-4xl mb-4"></i>
                  {renderPreview()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
