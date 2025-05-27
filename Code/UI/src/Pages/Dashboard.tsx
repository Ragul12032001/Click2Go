import React, {
  FC,
  ReactNode,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { Button } from "../Components/ui/button";
import {
  Activity,
  Check,
  DollarSign,
  SendHorizonal,
  Users,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../Components/ui/card";
import { Input } from "../Components/ui/input";
import { Label } from "../Components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../Components/ui/select";
import { toast, useToast } from "../Components/ui/use-toast";
import { Toaster } from "../Components/ui/toaster";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "../Components/ui/chart";
import { CalendarIcon, PaperPlaneIcon } from "@radix-ui/react-icons";
import { addDays, format, subDays } from "date-fns";
import { DateRange } from "react-day-picker";

import { cn } from "../lib/utils";
import { Calendar } from "../Components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../Components/ui/popover";
import axios from "axios";
import { Skeleton } from "../Components/ui/skeleton";
import config from "../config.json";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../State/store";
import { stat } from "fs";
import CircularProgress from "@mui/material/CircularProgress";
import { setPermissions, setUser_Role_Name, setSentCount, setTotalAvailableCount } from "../State/slices/AdvertiserAccountSlice";


interface Transactions {
  paymentId: string;
  amount: string;
  paymentDate: string;
  symbol: string;
  receipturl: string;
  name: string;
  messages: string;
  fundtype: string;
}

interface Channel {
  channelName: string;
}

interface DatePickerWithRangeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  // Prop that accepts a function with a number
  setChartData: (data: any) => void; // Prop that accepts a function with a number
  fetchData: () => void;
  setMessageSentDescription: React.Dispatch<React.SetStateAction<string>>;
  setDate: React.Dispatch<React.SetStateAction<DateRange | undefined>>;
  date: DateRange | undefined;
  setSelectedView: React.Dispatch<React.SetStateAction<string>>;
  setBefore30DaysData: React.Dispatch<React.SetStateAction<any[]>>;
  setLast30DaysData: React.Dispatch<React.SetStateAction<any[]>>;
}

export function DatePickerWithRange({
  className,
  setChartData,
  setMessageSentDescription,
  setSelectedView,
  date,
  setDate,
  setBefore30DaysData,
  setLast30DaysData
}: DatePickerWithRangeProps) {

  const dispatch = useDispatch();
  const toast = useToast();
  const Workspace_Id = useSelector(
    (state: RootState) => state.authentication.workspace_id
  );
  const apiUrlAdvAcc = useSelector(
    (state: RootState) => state.authentication.apiURL
  );


  useEffect(() => {
    console.log("The date is", date);
    if (date && date.from && date.to) {
      const date_from = format(date.from, "yyyy-MM-dd"); // Split by space and take the first part
      const date_to = format(date.to, "yyyy-MM-dd");

      const before30_from = "2024-01-01"; // All data before 30 days
      const before30_to = format(subDays(new Date(date_from), 1), "yyyy-MM-dd");

      const ChartDateRange = async () => {
        try {
          const [last30Days, before30Days] = await Promise.all([
            axios.get(`${apiUrlAdvAcc}/GetCombinedStatisticsByDateRange?workspaceId=${Workspace_Id}&from_date=${date_from.toString()}&to_date=${date_to.toString()}`),
            axios.get(`${apiUrlAdvAcc}/GetCombinedStatisticsByDateRange?workspaceId=${Workspace_Id}&from_date=${before30_from.toString()}&to_date=${before30_to.toString()}`) ]);
          
          if (
            last30Days.data.status === "Success" &&
            last30Days.data.chartDetails.length > 0
          ) {
            setLast30DaysData(last30Days.data.status === "Success" ? last30Days.data : 0);
            setBefore30DaysData(before30Days.data.status === "Success" ? before30Days.data : 0);
            setChartData(last30Days.data);
          } else {
            // setChartData(response.data);
            // fetchData();
            console.error("chart details not found");
          }
        } catch (error) {
          console.error("error in fetching chart details: ", error);
        }
      };

      ChartDateRange();
    } else {
      console.log("No date selected");
    }
  }, [date]);

  useEffect(() => {
    if (date?.from && date?.to) {
      setSelectedView("none");  // Set dropdown to None when date is picked
    }
  }, [date, setSelectedView]);

  return (
    <div className={cn("flex justify-end gap-2 pb-4 ", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "min-w-[150px] w-auto justify-start text-left font-normal border-E2E8F0",
              !date && "text-muted-foreground text-[#020617] "
            )}
          >
            <CalendarIcon
              className="mr-2 h-4 w-4"
              style={{ color: "#020617" }}
            />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
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
            defaultMonth={date?.from}
            selected={date}
            onSelect={(newDate) => {
              setDate(newDate);

              if (newDate?.from && newDate?.to) {
                const formattedFrom = format(newDate.from, "MMM dd, yyyy");
                const formattedTo = format(newDate.to, "MMM dd, yyyy");

                setMessageSentDescription(`Showing total messages sent from ${formattedFrom} to ${formattedTo}`); // ✅ Now updates dynamically!
                setSelectedView("none");
              }
            }}
            numberOfMonths={1}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

interface ChartData {
  date: string;
  email: number;
  SMS: number;
  pushNotifications: number;
  rcSmessages: number;
  WhatsApp: number;
  "Click2Go-WA": number;
}

interface DashChartProps {
  Data: ChartData[]; // Expecting an array of ChartData objects
  setTimeRange: React.Dispatch<React.SetStateAction<string>>;
  timeRange: string;
  isWeek: boolean;
  messageSentDescription: string;
  dynamicChartConfig: ChartConfig;
  checkedChannels: Channel[];
}


const DashChart: FC<DashChartProps> = ({
  Data,
  setTimeRange,
  timeRange,
  isWeek,
  messageSentDescription,
  dynamicChartConfig,
  checkedChannels
}) => {
  const chartData = Data.map((item) => {
    debugger;
    // Convert the date to a format without time
    // console.log(chartData);
    const date = new Date(item.date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

    return {
      ...item,
      date, // Replacing the full datetime with only the date part
    };
  });



  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date);
    const referenceDate = new Date("2024-06-30");
    let daysToSubtract = 90;
    if (timeRange === "30d") {
      daysToSubtract = 30;
    } else if (timeRange === "7d") {
      daysToSubtract = 7;
    }
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return date >= startDate;
  }); //
  return (
    <Card className="mt-[20px] w-[100%] relative mb-[100px] overflow-y-auto no-scrollbar min-h-[400px] h-auto ">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>Sent messages</CardTitle>
          <CardDescription>
            {messageSentDescription}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={dynamicChartConfig}
          className="aspect-auto h-[200px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              {/* Indosat Gradient */}
              <linearGradient id="fillIndosat" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(var(--chart-1))"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--chart-1))"
                  stopOpacity={0.1}
                />
              </linearGradient>

              {/* Sms Gradient */}
              <linearGradient id="fillSMS" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(var(--chart-2))"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--chart-2))"
                  stopOpacity={0.1}
                />
              </linearGradient>

              {/* Push Notifications Gradient */}
              <linearGradient
                id="fillPushNotifications"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="hsl(var(--chart-3))"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--chart-3))"
                  stopOpacity={0.1}
                />
              </linearGradient>

              {/* Click2go Gradient */}
              <linearGradient id="fillClick2Go-WA" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(var(--chart-4))"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--chart-4))"
                  stopOpacity={0.1}
                />
              </linearGradient>

              {/* Whatsapp Gradient */}
              <linearGradient id="fillWhatsApp" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(var(--chart-5))"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--chart-5))"
                  stopOpacity={1.0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                  indicator="dot"
                  className="min-w-[200px] max-w-[280px]"
                />
              }
            />
            {[...checkedChannels]
              .sort((a, b) => {
                if (a.channelName === "WhatsApp") return -1;
                if (b.channelName === "WhatsApp") return 1;
                if (a.channelName === "SMS") return -1;
                if (b.channelName === "SMS") return 1;
                return 0;
              })
              .map((channel: Channel) => (
                <Area
                  key={channel.channelName}
                  dataKey={channel.channelName}
                  type="natural"
                  fill={`url(#fill${channel.channelName})`}
                  stroke={
                    channel.channelName === "WhatsApp"
                      ? "hsl(var(--chart-5))"
                      : channel.channelName === "SMS"
                      ? "hsl(var(--chart-2))"
                      : channel.channelName === "Click2Go-WA"
                      ? "hsl(var(--chart-4))"
                      : "hsl(var(--chart-1))"
                  }
                  stackId="a"
                />
              ))}
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

interface CardProps {
  title: string;
  value: string | number;
  change: string;
  icon?: ReactNode;
}

const CardComponent: FC<CardProps> = ({ title, value, change, icon }) => {
  return (
    <Card className="w-full md:w-[200px] lg:w-[220px] xl:w-[240px] h-fit relative flex-grow border-[#E2E8F0] sidebar">
      <div className="p-1 pl-0 pr-0">
        {/* <DollarSign className='absolute top-7 right-6 text-gray-400'/> */}
        {icon && (
          <div className="absolute top-7 right-6 text-gray-400">{icon}</div>
        )}

        <CardHeader className="text-left pb-2">
          <CardTitle className="text-[14px] text-[#020617] font-medium leading-[20px] text-left">
            {title}
          </CardTitle>
        </CardHeader>
        {/* <CardContent className="text-left text-2xl font-bold "> */}
        <CardContent className="text-left text-[#020617] text-2xl font-bold leading-[24px] mt-1">
          {value}
          {/* <div className="text-sm text-gray-400 font-medium "> */}
          <div className="text-[12px] text-[#64748B] font-normal leading-[20px] mt-[2px]">
            {change}
          </div>
        </CardContent>
      </div>
    </Card>
  );
};


const Dashboard: FC = () => {
  const [checkedChannels, setCheckedChannels] = useState<Channel[]>([]);
  const [selectedView, setSelectedView] = useState<string>("month");
  const [date, setDate] = useState<DateRange | undefined>();
  const [chartData, setChartData] = useState<any>();
  //const [apiUrl, setApiUrl] = useState("");
  // const [apiUrlAdvAcc, setApiUrlAdvAcc] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [messageSentDescription, setMessageSentDescription] = useState<string>(
    "Showing total messages sent per month"
  );


  const [isWeek, setIsWeek] = useState(false);
  const [isMonth, setIsMonth] = useState(false);
  const [timeRange, setTimeRange] = React.useState("30d");
  const [last30DaysData, setLast30DaysData] = useState<any>(null);
  const [before30DaysData, setBefore30DaysData] = useState<any>(null);

  const [date_Week, setDate_Week] = React.useState<DateRange | undefined>({
    from: subDays(new Date(), 7), // 7 days before the current date
    to: new Date(), // Current date
  });
  const [date_Month, setDate_Month] = React.useState<DateRange | undefined>({
    from: subDays(new Date(), 30), // 7 days before the current date
    to: new Date(), // Current date
  });
  const Workspace_Id = useSelector(
    (state: RootState) => state.authentication.workspace_id
  );
  const EmailId = useSelector(
    (state: RootState) => state.authentication.userEmail
  );
  const isInvited = useSelector(
    (state: RootState) => state.authentication.isInvited
  );

  const [sentMessages, setSentMessages] = useState<number>(0);
  const [totalPurchasedMessages, setTotalPurchasedMessages] = useState<number>(0);


  const accountId = useSelector((state: RootState) => state.authentication.account_id);
  const apiUrlAdvAcc = useSelector((state: RootState) => state.authentication.apiURL);
  const apiUrl = useSelector((state: RootState) => state.authentication.authURL);
  const adminUrl = useSelector((state: RootState) => state.authentication.adminUrl);
  const roleId = useSelector((state: RootState) => state.authentication.role_id);
  console.log(Workspace_Id);
  const dispatch = useDispatch();

  useEffect(() => {
    if (apiUrlAdvAcc) {
      // GetCampaingCount();
      // fetchData();
      GetPermissionsByRoleId();
    }
  }, [apiUrlAdvAcc, Workspace_Id]);

  useEffect(() => {
    setIsLoading(true);
    setSelectedView("month");
    setIsMonth(true);
    setIsWeek(false);
    setTimeRange("30d");
    setDate(undefined);
    ByMonthData();
    fetchPast30DaysData();
    setMessageSentDescription("Showing total messages sent per month");
  }, [Workspace_Id]);

  const GetPermissionsByRoleId = async () => {

    const response2 = await axios.get(`${apiUrl}/GetPermissionsByRoleId?RoleID=${roleId}`);
    if (response2.data.status === "Success") {
      const permissions = JSON.parse(response2.data.roleDetails.permissions);
      const role_name = response2.data.roleDetails.roleName;
      dispatch(setPermissions(permissions));
      dispatch(setUser_Role_Name(role_name));


    } else {
      console.log("GetPermissionsByRoleId API error");
    }
  }
  // const fetchData = async () => {
  //   setIsLoading(true);
  //   if (apiUrlAdvAcc) {
  //     // Ensure apiUrlAdvAcc is valid
  //     try {

  //       usertransactionlist();

  //       console.log("apiUrlAdvAcc", apiUrlAdvAcc); // For debugging
  //       const data = {
  //         Email: EmailId,
  //         WorkdspaceId: Workspace_Id,
  //       };
  //       if (isInvited) {
  //         const response = await axios.put(`${apiUrl}/UpdateIsAccepted`, data);

  //         if (response.data.success == "Success") {
  //           console.log(
  //             "isAcceptec Response : " + response.data.status_Description
  //           );
  //         } else {
  //           console.log(
  //             "isAcceptec Response : " + response.data.status_Description
  //           );
  //         }
  //       }

  //       const response = await axios.get(
  //         `${apiUrlAdvAcc}/GetCombinedStatistics?workspaceId=${Workspace_Id}`
  //       );
  //       setIsLoading(false);
  //       console.log("API Response:", response.data); // Check the response
  //       setChartData(response.data);
  //       dispatch(setSentCount(response.data.messagesSentDetails[0]?.totalSent));

  //     } catch (error) {
  //       console.error("Error fetching the statistics:", error);
  //       setIsLoading(false);
  //     }
  //   }
  // };



  const usertransactionlist = async () => {
    try {
      const response = await axios.get(`${apiUrlAdvAcc}/GetuserTransaction?accountid=${accountId}`);
      console.log("Response : ", response.data.user_transaction);
      const data = response.data.user_transaction;
      if (response.data.status === "Success") {
        const creditMessageCount = Array.isArray(data)
          ? data.reduce((sum, item) => sum + Number(item.messages || 0), 0)
          : 0;
        console.log("CMC:    ", creditMessageCount);
        dispatch(setTotalAvailableCount(creditMessageCount));
      }
      else {
        console.error("error in retrieving user_transaction list or list does not exist")
      }
    } catch (error) {
      console.error("Error fetching Transaction details:", error);
    }

  }

  const ByWeekData = async () => {
    if (date_Week && date_Week.from && date_Week.to) {
      const date_from = format(date_Week.from, "yyyy-MM-dd"); // Split by space and take the first part
      const date_to = format(date_Week.to, "yyyy-MM-dd");

      const ChartDateRange = async () => {
        try {
          const response = await axios.get(
            `${apiUrlAdvAcc}/GetCombinedStatisticsByDateRange?workspaceId=${Workspace_Id}&from_date=${date_from.toString()}&to_date=${date_to.toString()}`
          );
          console.log("ByWeek API Response:", response.data);
          if (
            response.data.status === "Success" &&
            response.data.chartDetails.length > 0
          ) {
            setChartData(response.data);
          } else {
            // setChartData(response.data);
            // fetchData();
            console.error("chart details not found");
          }
        } catch (error) {
          console.error("error in fetching chart details: ", error);
        } finally {
          setIsLoading(false);
        }
      };

      ChartDateRange();

    }
  };

  const ByMonthData = async () => {
    if (date_Month && date_Month.from && date_Month.to) {
      const date_from = format(date_Month.from, "yyyy-MM-dd"); // Split by space and take the first part
      const date_to = format(date_Month.to, "yyyy-MM-dd");

      const ChartDateRange = async () => {
        try {
          const response = await axios.get(
            `${apiUrlAdvAcc}/GetCombinedStatisticsByDateRange?workspaceId=${Workspace_Id}&from_date=${date_from.toString()}&to_date=${date_to.toString()}`
          );
          console.log("ByMonth API Response:", response.data.chartDetails);
          if (
            response.data.status === "Success" &&
            response.data.chartDetails.length > 0
          ) {
            setChartData(response.data);
          } else {
            console.error("chart details not found");
          }
        } catch (error) {
          console.error("error in fetching chart details: ", error);
        } finally {
          setIsLoading(false);
        }
      };

      ChartDateRange();
    }
  };

  // useEffect(() => {
  //   if (apiUrlAdvAcc) {
  //     fetchData();
  //   }
  // }, [apiUrlAdvAcc, Workspace_Id]); // Depend on apiUrlAdvAcc

  const fetchPast7DaysData = async () => {
    if (!apiUrlAdvAcc || !Workspace_Id) return;

    const past_from = format(subDays(new Date(), 7), "yyyy-MM-dd"); // Last 7 days
    const past_to = format(new Date(), "yyyy-MM-dd"); // Today

    const before7_from = format(new Date("2024-01-01"), "yyyy-MM-dd"); // All data before the last 7 days
    const before7_to = format(subDays(new Date(), 7), "yyyy-MM-dd"); // Until 7 days ago

    try {
      setIsLoading(true);
      const [last7Days, before7Days] = await Promise.all([
        axios.get(`${apiUrlAdvAcc}/GetCombinedStatisticsByDateRange?workspaceId=${Workspace_Id}&from_date=${past_from}&to_date=${past_to}`),
        axios.get(`${apiUrlAdvAcc}/GetCombinedStatisticsByDateRange?workspaceId=${Workspace_Id}&from_date=${before7_from}&to_date=${before7_to}`)
      ]);

      setLast30DaysData(last7Days.data.status === "Success" ? last7Days.data : null);
      setBefore30DaysData(before7Days.data.status === "Success" ? before7Days.data : null);
    } catch (error) {
      console.error("Error fetching past 7 days data:", error);
    } finally {
      setIsLoading(false);
    }
  };


  const fetchPast30DaysData = async () => {
    if (!apiUrlAdvAcc || !Workspace_Id) return;

    const past_from = format(subDays(new Date(), 30), "yyyy-MM-dd"); // Last 30 days
    const past_to = format(new Date(), "yyyy-MM-dd"); // Today

    const before30_from = format(new Date("2024-01-01"), "yyyy-MM-dd"); // All data before the last 30 days
    const before30_to = format(subDays(new Date(), 30), "yyyy-MM-dd"); // Until 30 days ago

    try {
      setIsLoading(true);
      const [last30Days, before30Days] = await Promise.all([
        axios.get(`${apiUrlAdvAcc}/GetCombinedStatisticsByDateRange?workspaceId=${Workspace_Id}&from_date=${past_from}&to_date=${past_to}`),
        axios.get(`${apiUrlAdvAcc}/GetCombinedStatisticsByDateRange?workspaceId=${Workspace_Id}&from_date=${before30_from}&to_date=${before30_to}`)
      ]);

      setLast30DaysData(last30Days.data.status === "Success" ? last30Days.data : null);
      setBefore30DaysData(before30Days.data.status === "Success" ? before30Days.data : null);

    } catch (error) {
      console.error("Error fetching past 30 days data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const GetCheckedChannelsList = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching Checked Channels...");

      const response = await axios.get(
        `${apiUrlAdvAcc}/GetChannelList`
      );

      if (
        response.data.status === "Success" &&
        Array.isArray(response.data.channelList)
      ) {
        console.log("Checked Channels Response:", response.data.channels);

        // Normalize channel names
        const formattedChannels = response.data.channelList
        .filter((ch: any) =>
          ch.channel_name === "SMS" || ch.channel_name === "WhatsApp" || ch.channel_name === "Click2Go-WA"
        ).map((ch: any) => ({
          channelName: ch.channel_name, // <- ensure proper casing
        }));

        setCheckedChannels(formattedChannels);
      } else {
        console.log("Error fetching checked channels:", response);
        setCheckedChannels([]);
      }
    } catch (error) {
      console.error("Error fetching checked channels:", error);
      setCheckedChannels([]);
    } finally {
      setIsLoading(false);
    }
  };

  const dynamicChartConfig: ChartConfig = checkedChannels.reduce(
    (config, channel, index) => {
      config[channel.channelName] = {
        label: channel.channelName,
        color: `hsl(var(--chart-${index + 2}))`, // Dynamic color for all channels
      };
      return config;
    },
    {} as ChartConfig
  );

  // Fetch data on page load
  useEffect(() => {
    setChartData(null);
    setIsLoading(true);
    fetchPast30DaysData();
  }, [apiUrlAdvAcc, Workspace_Id]);


  const calculatePercentageChange = (
    last30Days: number, 
    before30Days: number, 
    date?: DateRange, // Optional date range parameter
    timeRange?: string
  ) => {
    let type = "last month"; // Default is month
    
    // If a custom date range is selected, change the type to "selected date range"
    if (date && date.from && date.to) {
      type = "selected date range";
    } else {
      // Existing logic for predefined time ranges
      if (timeRange === "7d") {
        type = "last week";
      } else if (timeRange === "30d") {
        type = "last month";
      }
    }
    if (!last30Days || last30Days === 0) return `+0% change for ${type}`;
    if (!before30Days || before30Days === 0) return `+0% change for ${type}`;
  
    const change = (last30Days / before30Days) * 100;
    return `${change > 0 ? "+" : ""}${change.toFixed(1)}% change for ${type}`;
  };

  const handleGetMessagesCount = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${apiUrlAdvAcc}/GetDebitandCreditMessagesCount?accountId=${accountId}`);
      console.log("Response : ", response.data);

      if (response.data.status === "Success" && response.data.messages_details.length > 0) {
        const messageDetails = response.data.messages_details[0];
        setSentMessages(messageDetails.sent_messages);
        setTotalPurchasedMessages(messageDetails.total_purchased_messages);
        dispatch(setSentCount(messageDetails.sent_messages));
        dispatch(setTotalAvailableCount(messageDetails.total_purchased_messages));
      } else {
        console.error("Error fetching messages count: response - ", response);
        setSentMessages(0);
        setTotalPurchasedMessages(0);
        dispatch(setSentCount(0));
        dispatch(setTotalAvailableCount(0));
      }
    } catch (error) {
      console.error("Error fetching messages count:", error);
      setSentMessages(0);
      setTotalPurchasedMessages(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsMonth(true);
    setTimeRange("30d");

    ByMonthData();
    fetchPast30DaysData();

    // Only on initial render
    if (apiUrlAdvAcc && Workspace_Id) {
      fetchPast30DaysData();
    }
  }, [apiUrlAdvAcc, Workspace_Id]);

  useEffect(() => {
    if (selectedView === "week" || selectedView === "month") {
      setDate(undefined);
    }
  }, [selectedView]);

  useEffect(() => {
    GetCheckedChannelsList();
    handleGetMessagesCount();
  }, [Workspace_Id]);


  return chartData ? (
    <div className="flex-col w-full">
      <Toaster />
      <div className="flex mt-[-15px] justify-end gap-2">
        <div>
          <DatePickerWithRange
            setChartData={setChartData}
            fetchData={ByMonthData}
            setMessageSentDescription={setMessageSentDescription}
            setDate={setDate}
            date={date}
            setSelectedView={setSelectedView}
            setBefore30DaysData={setBefore30DaysData}
            setLast30DaysData={setLast30DaysData}
          />
        </div>
        <div>
          <Select
            value={selectedView}
            defaultValue="month"
            onValueChange={(value) => {
              setSelectedView(value);
              if (value === "week" || value === "month") {
                setDate(undefined);
              }
              if (value === "week") {
                setIsWeek(true);
                setTimeRange("7d");
                setDate(undefined);
                ByWeekData();
                fetchPast7DaysData();
                setMessageSentDescription("Showing total messages sent per week");
              }
              else if (value === "month") {
                setIsMonth(true);
                setTimeRange("30d");
                setDate(undefined);
                ByMonthData();
                fetchPast30DaysData();
                setMessageSentDescription("Showing total messages sent per month");
              }
              else {
                setIsWeek(false);
                setIsMonth(false);
                setTimeRange("90d");
                // fetchData();
              }
            }}
          >
            <SelectTrigger className="w-[120px] h-9 text-[#020617] mt-6">
              <SelectValue placeholder="Select view" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem className="cursor-pointer" value="week">By Week</SelectItem>
              <SelectItem className="cursor-pointer" value="month">By Month</SelectItem>
              <SelectItem className="cursor-pointer" value="none">None</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 w-full justify-between border-orange-600">
        <CardComponent
          title="Campaigns"
          value={chartData?.campaignDetails[0]?.totalCampaigns || "0"}
          change={
            last30DaysData?.campaignDetails && before30DaysData?.campaignDetails
              ? calculatePercentageChange(
                last30DaysData?.campaignDetails[0]?.totalCampaigns,
                before30DaysData?.campaignDetails[0]?.totalCampaigns,
                date,
                timeRange
              )
              : "+0% from last month"
          }
          icon={<PaperPlaneIcon className="text-[#64748B] size-4" />}
        />

        <CardComponent
          title="Recipients"
          value={chartData?.recipientCount[0]?.recipients || "0"}
          change={
            last30DaysData?.recipientCount && before30DaysData?.recipientCount
              ? calculatePercentageChange(
                last30DaysData?.recipientCount[0]?.recipients,
                before30DaysData?.recipientCount[0]?.recipients,
                date,
                timeRange
              )
              : "+0% from last month"
          }
          icon={<Users className="text-[#64748B]" size={16} />}
        />
        <CardComponent
          title="Sent"
          value={chartData?.messagesSentDetails[0]?.totalSent || 0}
          change={
            last30DaysData?.messagesSentDetails && before30DaysData?.messagesSentDetails
              ? calculatePercentageChange(
                last30DaysData?.messagesSentDetails[0]?.totalSent,
                before30DaysData?.messagesSentDetails[0]?.totalSent,
                date,
                timeRange
              )
              : "+0% from last month"
          }
          icon={<Check className="text-[#64748B]" size={16} />}
        />
        <CardComponent
          title="Delivery rate"
          value={
            Math.round(
              ((chartData?.messagesSentDetails[0]?.totalSent /
                chartData?.recipientCount[0]?.recipients) *
                100) / (chartData?.campaignDetails[0]?.totalCampaigns) || 0
            ) + "%"
          }
          change={
            last30DaysData?.messagesSentDetails && before30DaysData?.messagesSentDetails
              ? calculatePercentageChange(
                (last30DaysData?.messagesSentDetails[0]?.totalSent / last30DaysData?.recipientCount[0]?.recipients),
                (before30DaysData?.messagesSentDetails[0]?.totalSent / before30DaysData?.recipientCount[0]?.recipients),
                date,
                timeRange
              )
              : "+0% from last month"
          }
          icon={<Activity className="text-[#64748B]" size={16} />}
        />
      </div>
      {/* <DashChart data={chartData?.chartDetails} isWeek={isWeek} /> */}

      <DashChart
        Data={chartData.chartDetails}
        setTimeRange={setTimeRange}
        timeRange={timeRange}
        isWeek={isWeek}
        messageSentDescription={messageSentDescription}
        dynamicChartConfig={dynamicChartConfig}
        checkedChannels={checkedChannels}
      />
    </div>
  ) : (
    <div>
      {isLoading && (
        <div className="flex flex-col items-center justify-center h-[500px]">
          <CircularProgress color="success" />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
