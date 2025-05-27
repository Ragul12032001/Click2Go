import React, { FC, ReactNode, useEffect, useState } from "react";
import { Button } from "../../Components/ui/button";
import { Activity, Check, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../Components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "src/Components/ui/select";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, } from "../../Components/ui/chart";
import { CalendarIcon, PaperPlaneIcon } from "@radix-ui/react-icons";
import { addDays, format, subDays } from "date-fns";
import { DateRange } from "react-day-picker";
import { cn } from "../../lib/utils";
import { Calendar } from "../../Components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../../Components/ui/popover";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../State/store";
import { toast, useToast } from "../../Components/ui/use-toast";
import { Toaster } from "../../Components/ui/toaster";
import { Skeleton } from "../../Components/ui/skeleton";
import { setAdminUrl } from "../../State/slices/AuthenticationSlice";
import { Console } from "console";
import CircularProgress from "@mui/material/CircularProgress";


interface Channel {
  channelName: string;
}

interface DatePickerWithRangeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  // Prop that accepts a function with a number
  setChartData: (data: any) => void; // Prop that accepts a function with a number
  fetchData: () => void;
  setUserCount: React.Dispatch<React.SetStateAction<number>>
  setWorkspaceCount: React.Dispatch<React.SetStateAction<number>>
  setCampaignCount: React.Dispatch<React.SetStateAction<number>>
  setSelectedDateRangeForAdSpend: React.Dispatch<React.SetStateAction<DateRange | undefined>>;
  setAdSpendDescription: React.Dispatch<React.SetStateAction<string>>;
  setMessageSentDescription: React.Dispatch<React.SetStateAction<string>>;
  setDate: React.Dispatch<React.SetStateAction<DateRange | undefined>>;
  date: DateRange | undefined;
  setSelectedView: React.Dispatch<React.SetStateAction<string>>;
  setBefore30DaysUsers: React.Dispatch<React.SetStateAction<number>>;
  setLast30DaysUsers: React.Dispatch<React.SetStateAction<number>>;
  setLast30DaysWorkspaces: React.Dispatch<React.SetStateAction<number>>;
  setBefore30DaysWorkspaces: React.Dispatch<React.SetStateAction<number>>;
  setLast30DaysCampaigns: React.Dispatch<React.SetStateAction<number>>;
  setBefore30DaysCampaigns: React.Dispatch<React.SetStateAction<number>>;
}

export function DatePickerWithRange({
  className,
  setChartData,
  // fetchData,
  setUserCount,
  setWorkspaceCount,
  setCampaignCount,
  setSelectedDateRangeForAdSpend,
  setAdSpendDescription,
  setMessageSentDescription,
  setSelectedView,
  date,
  setDate,
  setBefore30DaysUsers,
  setLast30DaysUsers,
  setLast30DaysWorkspaces,
  setBefore30DaysWorkspaces,
  setLast30DaysCampaigns,
  setBefore30DaysCampaigns
}: DatePickerWithRangeProps) {
  const dispatch = useDispatch();
  const toast = useToast();
  const Workspace_Id = useSelector(
    (state: RootState) => state.authentication.workspace_id
  );
 
  const apiUrlAdminAcc = useSelector(
    (state: RootState) => state.authentication.adminUrl
  );
  // const [apiUrlAdminAcc, setapiUrlAdminAcc] = useState("");
  // const [apiUrlAdvAcc, setApiUrlAdvAcc] = useState("");

  // useEffect(() => {
  //   const loadConfig = async () => {
  //     try {
  //       const response = await fetch("/config.json");
  //       const config = await response.json();
  //       setApiUrlAdvAcc(config.ApiUrlAdvAcc);
  //       // setApiUrl(config.API_URL) // Set the API URL from config
  //     } catch (error) {
  //       console.error("Error loading config:", error);
  //     }
  //   };

  //   loadConfig();
  // }, []);

  // useEffect(() => {
  //   const fetchConfig = async () => {
  //     try {
  //       const response = await fetch("/config.json");
  //       const config = await response.json();
  //       // setapiUrlAdminAcc(config.ApiUrlAdminAcc);
  //       console.log("apiUrlAdminAcc:" , apiUrlAdminAcc);
  //     } catch (error) {
  //       console.error("Error loading config:", error);
  //     }
  //   };

  //   fetchConfig();
  // }, []);

  useEffect(() => {
    console.log("The date is", date);
    if (date && date.from && date.to) {
      const date_from = format(date.from, "yyyy-MM-dd"); // Split by space and take the first part
      const date_to = format(date.to, "yyyy-MM-dd");

      const before30_from = "2024-01-01"; // All data before 30 days
      const before30_to = format(subDays(new Date(date_from), 1), "yyyy-MM-dd");

      const GetDataByDateRange = async () => {
        try {
          const [
            last30DaysUsers, before30DaysUsers,
            last30DaysWorkspaces, before30DaysWorkspaces,
            last30DaysCampaigns, before30DaysCampaigns
          ] = await Promise.all([
            axios.get(`${apiUrlAdminAcc}/GetUserCountByDateRange?from_date=${date_from}&to_date=${date_to}`),
            axios.get(`${apiUrlAdminAcc}/GetUserCountByDateRange?from_date=${before30_from}&to_date=${before30_to}`),
            axios.get(`${apiUrlAdminAcc}/GetWorkspaceCountByDateRange?from_date=${date_from}&to_date=${date_to}`),
            axios.get(`${apiUrlAdminAcc}/GetWorkspaceCountByDateRange?from_date=${before30_from}&to_date=${before30_to}`),
            axios.get(`${apiUrlAdminAcc}/GetCampaignsCountByDateRange?from_date=${date_from}&to_date=${date_to}`),
            axios.get(`${apiUrlAdminAcc}/GetCampaignsCountByDateRange?from_date=${before30_from}&to_date=${before30_to}`)
          ]);

          setLast30DaysUsers(last30DaysUsers.data.status === "Success" ? last30DaysUsers.data.totalUserCount : 0);
          setBefore30DaysUsers(before30DaysUsers.data.status === "Success" ? before30DaysUsers.data.totalUserCount : 0);
          setUserCount(last30DaysUsers.data.totalUserCount);

          setLast30DaysWorkspaces(last30DaysWorkspaces.data.status === "Success" ? last30DaysWorkspaces.data.totalWorkspaceCount : 0);
          setBefore30DaysWorkspaces(before30DaysWorkspaces.data.status === "Success" ? before30DaysWorkspaces.data.totalWorkspaceCount : 0);
          setWorkspaceCount(last30DaysWorkspaces.data.totalWorkspaceCount);

          setLast30DaysCampaigns(last30DaysCampaigns.data.status === "Success" ? last30DaysCampaigns.data.totalCampaignsCount : 0);
          setBefore30DaysCampaigns(before30DaysCampaigns.data.status === "Success" ? before30DaysCampaigns.data.totalCampaignsCount : 0);
          setCampaignCount(last30DaysCampaigns.data.totalCampaignsCount);
        }
        catch (error) {
          console.error("Error fetching user count data, due to:", error);
        }
      }

      // const GetWorkspaceCountByDateRange = async () => {
      //   try {
      //     const [last30DaysWorkspaces, before30DaysWorkspaces] = await Promise.all([
      //       axios.get(`${apiUrlAdminAcc}/GetWorkspaceCountByDateRange?from_date=${date_from.toString()}&to_date=${date_to.toString()}`),
      //       axios.get(`${apiUrlAdminAcc}/GetWorkspaceCountByDateRange?from_date=${before30_from.toString()}&to_date=${before30_to.toString()}`) ]);
      //     if (last30DaysWorkspaces.data.status === "Success") {
      //       setLast30DaysWorkspaces(last30DaysWorkspaces.data.status === "Success" ? last30DaysWorkspaces.data : null);
      //       setBefore30DaysWorkspaces(before30DaysWorkspaces.data.status === "Success" ? before30DaysWorkspaces.data : null);
      //       setWorkspaceCount(last30DaysWorkspaces.data.totalWorkspaceCount);
      //     }
      //     else {
      //       console.error("Error fetching user count data");
      //     }
      //   }
      //   catch (error) {
      //     console.error("Error fetching user count data, due to:", error);
      //   }
      // }

      // const GetCampaignsCountByDateRange = async () => {
      //   try {
      //     const [last30DaysCampaigns, before30DaysCampaigns] = await Promise.all([
      //       axios.get(`${apiUrlAdminAcc}/GetCampaignsCountByDateRange?from_date=${date_from.toString()}&to_date=${date_to.toString()}`),
      //       axios.get(`${apiUrlAdminAcc}/GetCampaignsCountByDateRange?from_date=${date_from.toString()}&to_date=${date_to.toString()}`) ]);
      //     if (last30DaysCampaigns.data.status === "Success") {
      //       setLast30DaysCampaigns(last30DaysCampaigns.data.status === "Success" ? last30DaysCampaigns.data : null);
      //       setBefore30DaysCampaigns(before30DaysCampaigns.data.status === "Success" ? before30DaysCampaigns.data : null);
      //       setCampaignCount(last30DaysCampaigns.data.totalCampaignsCount);
      //     }
      //     else {
      //       console.error("Error fetching user count data");
      //     }
      //   }
      //   catch (error) {
      //     console.error("Error fetching user count data, due to:", error);
      //   }
      // }

      const ChartDateRange = async () => {
        try {
          const response = await axios.get(
            `${apiUrlAdminAcc}/GetAdminDashboardChartDetailsByDateRange?from_date=${date_from.toString()}&to_date=${date_to.toString()}`
          );

          if (
            response.data.status === "Success" &&
            response.data.chartData.length > 0
          ) {
            setChartData(response.data);
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
      GetDataByDateRange();

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
              setSelectedDateRangeForAdSpend(newDate); // ✅ Update selected date range

              if (newDate?.from && newDate?.to) {
                const formattedFrom = format(newDate.from, "MMM dd, yyyy");
                const formattedTo = format(newDate.to, "MMM dd, yyyy");
                setAdSpendDescription(`Showing total ad spend from ${formattedFrom} to ${formattedTo}`);
                setMessageSentDescription(`Showing total messages sent from ${formattedFrom} to ${formattedTo}`)
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

interface AdChartData {
  week: string;
  SMS: number;
  WhatsApp: number;
  "Click2Go-WA": number;
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
  channels: Channel[];
}

interface AdDashChartProps {
  data: AdChartData[]; // Expecting an array of ChartData objects
  setTimeRange: React.Dispatch<React.SetStateAction<string>>;
  timeRange: string;
  isWeek: boolean;
  adSpendDescription: string;
  dynamicChartConfig: ChartConfig;
  channels: Channel[];
}

const SecondDashChart: FC<DashChartProps> = ({ Data, setTimeRange, timeRange, isWeek, messageSentDescription, dynamicChartConfig, channels }) => {

  const chartData = Data.map((item) => {
    // Convert the date to a format without time
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

  // const [timeRange, setTimeRange] = React.useState("90d")
  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date)
    const referenceDate = new Date("2024-06-30")
    let daysToSubtract = 90
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate
  })
  return (
    <Card className="mt-[20px] w-[100%] h-fit relative mb-[100px]">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>Sent messages</CardTitle>
          <CardDescription>
            {messageSentDescription}
          </CardDescription>
        </div>
        {/* <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="w-[160px] rounded-lg sm:ml-auto"
            aria-label="Select a value"
          >
            <SelectValue placeholder="Last 3 months" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="90d" className="rounded-lg">
              Last 3 months
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              Last 30 days
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              Last 7 days
            </SelectItem>
          </SelectContent>
        </Select> */}
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={dynamicChartConfig}
          className="aspect-auto h-[200px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              {/* Email Gradient */}
              {/* <linearGradient id="fillEmail" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8} />
                <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1} />
              </linearGradient> */}

              {/* Sms Gradient */}
              <linearGradient id="fillSMS" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8} />
                <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.1} />
              </linearGradient>

              {/* Push Notifications Gradient */}
              {/* <linearGradient id="fillPushNotifications" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.8} />
                <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0.1} />
              </linearGradient>

              {/* RCS Messages Gradient */}
              <linearGradient id="fillClick2Go-WA" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-4))" stopOpacity={0.8} />
                <stop offset="95%" stopColor="hsl(var(--chart-4))" stopOpacity={0.1} />
              </linearGradient>

              {/* Whatsapp Gradient */}
              <linearGradient id="fillWhatsApp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-5))" stopOpacity={0.8} />
                <stop offset="95%" stopColor="hsl(var(--chart-5))" stopOpacity={1.0} />
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
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
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
                    })
                  }}
                  indicator="dot"
                  className="min-w-[200px] max-w-[280px]"
                />
              }
            />
            {channels.map((channel: Channel) => (
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
  )
}

const DashChart: FC<AdDashChartProps> = ({ data, setTimeRange, timeRange, isWeek, adSpendDescription, dynamicChartConfig, channels  }) => {
  // console.log("✅ Data received by DashChart:", data);


  return (
    <Card className="mt-[20px] w-[100%] h-fit relative">
      <CardHeader className="text-left">
        <CardTitle className="text-[#1C2024]">Ad spend</CardTitle>
        <CardDescription className="text-[#60646C] font-normal">{adSpendDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={dynamicChartConfig} className="w-full h-[200px]">
          <AreaChart
            accessibilityLayer
            data={data}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
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
                    })
                  }}
                  indicator="dot"
                  className="min-w-[200px] max-w-[280px]"
                />
              }
            />
            {channels.map((channel: Channel) => (
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


// const SecondDashChart: FC<DashChartProps> = ({ data = fallbackData }) => {
//   const chartConfig = {
//     sms: {
//       label: "sms",
//       color: "hsl(var(--chart-5))",  // Different color for the second chart
//     },
//     whatsapp: {
//       label: "whatsapp",
//       color: "hsl(var(--chart-3))", // Different color for the second chart
//     },
//   };

//   return (
//     <Card className="mt-[20px] w-[100%] h-fit relative mb-[100px]">
//       <CardHeader className="text-left">
//         <CardTitle className="text-[#1C2024]">Send messages</CardTitle>
//         <CardDescription className="text-[#60646C] font-normal">Showing total messages sent for the last week</CardDescription>
//       </CardHeader>
//       <CardContent>
//         <ChartContainer config={chartConfig} className="w-full h-[200px]">
//           <AreaChart
//             accessibilityLayer
//             data={data}
//             margin={{
//               left: 12,
//               right: 12,
//             }}
//           >
//             <CartesianGrid vertical={false} />
//             <XAxis
//               dataKey="week"
//               tickLine={false}
//               axisLine={false}
//               tickMargin={8}
//               tickFormatter={(value) => value.slice(0, 3)}
//             />
//             <ChartTooltip
//               cursor={false}
//               content={<ChartTooltipContent indicator="line" />}
//             />
//             {/* Define the areas for each data type */}
//             <Area
//               dataKey="sms"
//               type="natural"
//               fill={chartConfig.sms.color}
//               fillOpacity={0.4}
//               stroke={chartConfig.sms.color}
//               stackId="a"
//             />
//             <Area
//               dataKey="whatsApp"
//               type="natural"
//               fill={chartConfig.whatsapp.color}
//               fillOpacity={0.4}
//               stroke={chartConfig.whatsapp.color}
//               stackId="a"
//             />
//             <ChartLegend content={<ChartLegendContent />} />
//           </AreaChart>
//         </ChartContainer>
//       </CardContent>
//     </Card>
//   );
// };

interface CardProps {
  title: string;
  value: number | String;
  change: string;
  icon?: ReactNode;
  selectedCurrency?: string; 
  setSelectedCurrency?: React.Dispatch<React.SetStateAction<string>>;
  isCountrySelected?: boolean; 
  setIsCountrySelected?: React.Dispatch<React.SetStateAction<boolean>>;
  amountSpent?: number; 
  selectedDateRangeForAdSpend?: DateRange;
  fetchAmountSpent?: (currency: string, country: string, dateRange: DateRange) => void;
  setAmountSpent?: React.Dispatch<React.SetStateAction<number>>;
  handleCurrencyChange?: (value: string) => void;
}

const CardComponent: FC<CardProps> = ({ title, value, change, icon, selectedCurrency = "", setSelectedCurrency,
  isCountrySelected = false,
  setIsCountrySelected,
  amountSpent = 0,
  fetchAmountSpent,
  handleCurrencyChange, }) => {
  // const [selectedCurrency, setSelectedCurrency] = useState<string>("");
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30), // Last 30 days
    to: new Date(),               // Today's date
  });
  const [currencyList, setCurrencyList] = useState<{ currency_name: string; country_name: string }[]>([]);
  // const [amountSpent, setAmountSpent] = useState<number>(0);
  // const [isCountrySelected, setIsCountrySelected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const apiUrlAdminAcc = useSelector((state: RootState) => state.authentication.adminUrl);

  useEffect(() => {
    const fetchCountryListWithCurrency = async () => {
      try {
        const response = await axios.get(`${apiUrlAdminAcc}/GetAllCountriesWithCurrencyName`);
        if (response.data.status === "Success") {
          console.log(response.data.countryList);
          setCurrencyList(response.data.countryList ?? []);

          const defaultCurrency = response.data.countryList.find((item: any) =>
            item.currency_name === "INR" && item.country_name === "India"
          );

          if (defaultCurrency) {
            const initialCurrency = `${defaultCurrency.currency_name}-${defaultCurrency.country_name}`;
            setSelectedCurrency?.(initialCurrency);
            setIsCountrySelected?.(true);
            fetchAmountSpent?.("AED", "United Arab Emirates", { from: subDays(new Date(), 30), to: new Date() });
          }
        } else {
          console.error("Failed to fetch currency list:", response.data.status_Description);
        }
      } catch (error) {
        console.error("Error fetching currency list:", error);
      }
    };

    if (apiUrlAdminAcc) {
      fetchCountryListWithCurrency();
    }
  }, [apiUrlAdminAcc]);


  return (
    <Card className="w-full md:w-[200px] lg:w-[220px] xl:w-[240px] h-[150px] relative flex-grow border-[#E2E8F0] sidebar">
      <div className="p-1 pl-0 pr-0 h-full flex flex-col justify-between">
        {icon && (
          <div className="absolute top-7 right-6 text-gray-400">{icon}</div>
        )}

        <CardHeader className="text-left">
          <CardTitle className="text-[14px] text-[#020617] font-medium leading-[20px]">
            {title}
          </CardTitle>

          {title === "Ad Spend" && (
            <Select
              value={selectedCurrency}
              onValueChange={(value) => {
                if (handleCurrencyChange) {
                  handleCurrencyChange?.(value);
                }
              }}
            >
              <SelectTrigger className="w-full mt-2 h-7 text-[#020617] border border-[#E2E8F0] rounded-md">
                <SelectValue placeholder="Select Country" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px] overflow-y-auto">
                {currencyList.length > 0 ? (
                  currencyList.map((currency, index) => (
                    <SelectItem className="cursor-pointer" key={index} value={`${currency.currency_name}-${currency.country_name}`}>
                      {`${currency.currency_name} (${currency.country_name})`}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="No Currency" disabled>
                    No Currency Found
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          )}
        </CardHeader>

        <CardContent className="text-left text-[#020617] text-2xl font-bold leading-[24px] mt-[-18px]">
          {isCountrySelected ? (
            isLoading ? (
              <div className="text-[14px] text-[#64748B]">Loading...</div>
            ) : (
              `${selectedCurrency.split('-')[0]} ${amountSpent}`
            )
          ) : (
            value
          )}
          <div className="text-[12px] text-[#64748B] font-normal leading-[20px] mt-[2px]">
            {change}
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

const SkeletonCard: FC = () => {
  return (
    <div className="flex-col">
      <div className="flex flex-wrap gap-2">
        <Card className="w-full md:w-[200px] lg:w-[220px] xl:w-[240px] h-fit relative ">
          <Skeleton className="absolute top-5 right-2 text-gray-200" />
          <CardHeader className="text-left">
            <Skeleton className="h-4 w-[100px]" />
          </CardHeader>
          <CardContent className="text-left text-2xl font-bold">
            <Skeleton className="h-4 mt-2 w-[100px]" />
            <div className="text-sm text-gray-400 font-medium">
              <Skeleton className="h-4 w-[100px]" />
            </div>
          </CardContent>
        </Card>
      </div>
      <Skeleton />
    </div>
  );
};

const SkeletonChart: FC = () => {
  return (
    <Card className="mt-[20px] w-full md:w-[400px] lg:w-[500px] xl:w-[1000px] h-fit relative">
      <CardHeader className="text-left">
        <CardTitle>
          <Skeleton className="w-full h-" />
        </CardTitle>
        <CardDescription>
          <Skeleton className="w-[200px] h-4" />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="w-full h-[200px]">
          <Skeleton className="w-full h-full" />
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

const AdminHome: FC = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedView, setSelectedView] = useState<string>("month");
    const [date, setDate] = useState<DateRange | undefined>();
  const [adSpendChartData, setAdSpendChartData] = useState<{ chartData: any[] }>({ chartData: [] });
  const [amountSpent, setAmountSpent] = useState<number>(0);
  const [selectedCurrency, setSelectedCurrency] = useState<string>("");
  const [isCountrySelected, setIsCountrySelected] = useState<boolean>(false);
  const [adSpendDescription, setAdSpendDescription] = useState<string>(
    "Showing total ad spend for the last month"
  );

  const [messageSentDescription, setMessageSentDescription] = useState<string>(
    "Showing total messages sent per month"
  );
  

  const [selectedDateRangeForAdSpend, setSelectedDateRangeForAdSpend] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30), // Default last 30 days
    to: new Date(),
  });


  const [chartData, setChartData] = useState<any>();
  // const [apiUrlAdminAcc, setapiUrlAdminAcc] = useState("");

  const [userCount, setUserCount] = useState<number | 0>(0);
  const [workspaceCount, setWorkspaceCount] = useState<number | 0>(0);
  const [campaignsCount, setCampaignsCount] = useState<number | 0>(0);

  const [isWeek, setIsWeek] = useState(false);
  const [isMonth, setIsMonth] = useState(false);
  const [timeRange, setTimeRange] = React.useState("30d");
  const [last30DaysUsers, setLast30DaysUsers] = useState<number | 0>(0);
  const [before30DaysUsers, setBefore30DaysUsers] = useState<number | 0>(0);

  const [last30DaysWorkspaces, setLast30DaysWorkspaces] = useState<number | 0>(0);
  const [before30DaysWorkspaces, setBefore30DaysWorkspaces] = useState<number | 0>(0);

  const [last30DaysCampaigns, setLast30DaysCampaigns] = useState<number | 0>(0);
  const [before30DaysCampaigns, setBefore30DaysCampaigns] = useState<number | 0>(0);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [date_Week, setDate_Week] = React.useState<DateRange | undefined>({
    from: subDays(new Date(), 7), // 7 days before the current date
    to: new Date(), // Current date
  });
  const [date_Month, setDate_Month] = React.useState<DateRange | undefined>({
    from: subDays(new Date(), 30), // 30 days before the current date
    to: new Date(), // Current date
  });
  const dispatch = useDispatch();
  const apiUrlAdminAcc = useSelector(
    (state: RootState) => state.authentication.adminUrl
  );

  const apiUrlAdvAcc = useSelector(
    (state: RootState) => state.authentication.apiURL
  );

  // useEffect(() => {
  //   const fetchConfig = async () => {
  //     try {
  //       const response = await fetch("/config.json");
  //       const config = await response.json();
  //       // setapiUrlAdminAcc(config.ApiUrlAdminAcc);
  //       // dispatch(setAdminUrl(config.ApiUrlAdminAcc));
  //       console.log("apiUrlAdminAcc:" , apiUrlAdminAcc);
  //     } catch (error) {
  //       console.error("Error loading config:", error);
  //     }
  //   };

  //   fetchConfig();
  // }, []);

  const byWeekData = async () => {
    if (date_Week && date_Week.from && date_Week.to) {
      const date_from = format(date_Week.from, "yyyy-MM-dd"); // Split by space and take the first part
      const date_to = format(date_Week.to, "yyyy-MM-dd");

      const GetUserCountByDateRange = async () => {
        setIsLoading(true);
        try {
          const response = await axios.get(`${apiUrlAdminAcc}/GetUserCountByDateRange?from_date=${date_from.toString()}&to_date=${date_to.toString()}`);
          if (response.data.status === "Success") {
            //setData
            setUserCount(response.data.totalUserCount);
          }
          else {
            console.error("Error fetching user count data");
          }
        }
        catch (error) {
          console.error("Error fetching user count data, due to:", error);
        } finally {
          setIsLoading(false);
        }
      }

      const GetWorkspaceCountByDateRange = async () => {
        setIsLoading(true);
        try {
          const response = await axios.get(`${apiUrlAdminAcc}/GetWorkspaceCountByDateRange?from_date=${date_from.toString()}&to_date=${date_to.toString()}`);
          if (response.data.status === "Success") {
            //setData
            setWorkspaceCount(response.data.totalWorkspaceCount);
          }
          else {
            console.error("Error fetching user count data");
          }
        }
        catch (error) {
          console.error("Error fetching user count data, due to:", error);
        } finally {
          setIsLoading(false);
        }
      }

      const GetCampaignsCountByDateRange = async () => {
        setIsLoading(true);
        try {
          const response = await axios.get(`${apiUrlAdminAcc}/GetCampaignsCountByDateRange?from_date=${date_from.toString()}&to_date=${date_to.toString()}`);
          if (response.data.status === "Success") {
            //setData
            setCampaignsCount(response.data.totalCampaignsCount);
          }
          else {
            console.error("Error fetching user count data");
          }
        }
        catch (error) {
          console.error("Error fetching user count data, due to:", error);
        } finally {
          setIsLoading(false);
        }
      }

      const ChartDateRange = async () => {
        setIsLoading(true);
        try {
          const response = await axios.get(
            `${apiUrlAdminAcc}/GetAdminDashboardChartDetailsByDateRange?from_date=${date_from.toString()}&to_date=${date_to.toString()}`
          );

          if (
            response.data.status === "Success" &&
            response.data.chartData.length > 0
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
      GetCampaignsCountByDateRange();
      GetUserCountByDateRange();
      GetWorkspaceCountByDateRange();

    } else {
      console.log("No date selected");
    }
  }

  const byMonthData = async () => {
    if (date_Month && date_Month.from && date_Month.to) {
      const date_from = format(date_Month.from, "yyyy-MM-dd"); // Split by space and take the first part
      const date_to = format(date_Month.to, "yyyy-MM-dd");

      const GetUserCountByDateRange = async () => {
        setIsLoading(true);
        try {
          const response = await axios.get(`${apiUrlAdminAcc}/GetUserCountByDateRange?from_date=${date_from.toString()}&to_date=${date_to.toString()}`);
          if (response.data.status === "Success") {
            //setData
            setUserCount(response.data.totalUserCount);
          }
          else {
            console.error("Error fetching user count data");
          }
        }
        catch (error) {
          console.error("Error fetching user count data, due to:", error);
        } finally {
          setIsLoading(false);
        }
      }

      const GetWorkspaceCountByDateRange = async () => {
        setIsLoading(true);
        try {
          const response = await axios.get(`${apiUrlAdminAcc}/GetWorkspaceCountByDateRange?from_date=${date_from.toString()}&to_date=${date_to.toString()}`);
          if (response.data.status === "Success") {
            //setData
            setWorkspaceCount(response.data.totalWorkspaceCount);
          }
          else {
            console.error("Error fetching user count data");
          }
        }
        catch (error) {
          console.error("Error fetching user count data, due to:", error);
        } finally {
          setIsLoading(false);
        }
      }

      const GetCampaignsCountByDateRange = async () => {
        setIsLoading(true);
        try {
          const response = await axios.get(`${apiUrlAdminAcc}/GetCampaignsCountByDateRange?from_date=${date_from.toString()}&to_date=${date_to.toString()}`);
          if (response.data.status === "Success") {
            //setData
            setCampaignsCount(response.data.totalCampaignsCount);
          }
          else {
            console.error("Error fetching user count data");
          }
        }
        catch (error) {
          console.error("Error fetching user count data, due to:", error);
        } finally {
          setIsLoading(false);
        }
      }

      const ChartDateRange = async () => {
        setIsLoading(true);
        try {
          const response = await axios.get(
            `${apiUrlAdminAcc}/GetAdminDashboardChartDetailsByDateRange?from_date=${date_from.toString()}&to_date=${date_to.toString()}`
          );

          if (
            response.data.status === "Success" &&
            response.data.chartData.length > 0
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
      GetCampaignsCountByDateRange();
      GetUserCountByDateRange();
      GetWorkspaceCountByDateRange();

    } else {
      console.log("No date selected");
    }
  }

  // Fetch user count
  const getUserCount = async () => {
    setIsLoading(true);
    try {
      console.log("Fetching User Count...");
      const response = await axios.get(`${apiUrlAdminAcc}/GetUserCount`);
      console.log("User Count Response:", response.data);
      if (response.data && response.data.totalUserCount !== undefined) {
        setUserCount(response.data.totalUserCount);
      } else {
        console.log("No user count available in response.");
      }
    } catch (error) {
      console.error("Error fetching user count:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch workspace count
  const getWorkspaceCount = async () => {
    setIsLoading(true);
    try {
      console.log("Fetching Workspace Count...");
      const response = await axios.get(`${apiUrlAdminAcc}/GetWorkspaceCount`);
      console.log("Workspace Count Response:", response.data);
      if (response.data && response.data.totalWorkspaceCount !== undefined) {
        setWorkspaceCount(response.data.totalWorkspaceCount);
      } else {
        console.log("No workspace count available in response.");
      }
    } catch (error) {
      console.error("Error fetching workspace count:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch campaigns count
  const getCampaignsCount = async () => {
    setIsLoading(true);
    try {
      console.log("Fetching Campaigns Count...");
      const response = await axios.get(`${apiUrlAdminAcc}/GetCampaignsCount`);
      console.log("Campaigns Count Response:", response.data);
      if (response.data && response.data.totalCampaignsCount !== undefined) {
        setCampaignsCount(response.data.totalCampaignsCount);
      } else {
        console.log("No campaigns count available in response.");
      }
    } catch (error) {
      console.error("Error fetching campaigns count:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Call all APIs on component mount
  // useEffect(() => {
  //   if (apiUrlAdminAcc) {
  //     // fetchData();
  //     getUserCount();
  //     getWorkspaceCount();
  //     getCampaignsCount();
  //   }
  // }, [apiUrlAdminAcc]);



  // const fetchData = async () => {
  //   const data = fallbackData; // Use static data or fetched data here
  //   setChartData(data);
  // };

  // useEffect(() => {
  //   const loadConfig = async () => {
  //     try {
  //       const response = await fetch("/config.json");
  //       const config = await response.json();
  //       setApiUrlAdvAcc(config.ApiUrlAdvAcc);
  //       setApiUrl(config.API_URL); // Set the API URL from config
  //     } catch (error) {
  //       console.error("Error loading config:", error);
  //     }
  //   };

  //   loadConfig();
  // }, [Workspace_Id]);

  // const fetchData = async () => {
  //   if (apiUrlAdminAcc) {
  //     // Ensure apiUrlAdminAcc is valid
  //     try {
  //       console.log("apiUrlAdminAcc", apiUrlAdminAcc); // For debugging
  //       const response = await axios.get(
  //         `${apiUrlAdminAcc}/GetAdminDashboardChartDetails`
  //       );
  //       console.log("API Response:", response.data); // Check the response
  //       setChartData(response.data);
  //     } catch (error) {
  //       console.error("Error fetching the statistics:", error);
  //     }
  //   }
  // };

  const fetchPast7DaysData = async () => {
    const past_from = format(subDays(new Date(), 7), "yyyy-MM-dd");
    const past_to = format(new Date(), "yyyy-MM-dd");

    const before7_from = format(new Date("2000-01-01"), "yyyy-MM-dd");
    const before7_to = format(subDays(new Date(), 7), "yyyy-MM-dd");

    try {
      setIsLoading(true);
      const [
        last7Users, before7Users,
        last7Workspaces, before7Workspaces,
        last7Campaigns, before7Campaigns
      ] = await Promise.all([
        axios.get(`${apiUrlAdminAcc}/GetUserCountByDateRange?from_date=${past_from}&to_date=${past_to}`),
        axios.get(`${apiUrlAdminAcc}/GetUserCountByDateRange?from_date=${before7_from}&to_date=${before7_to}`),
        axios.get(`${apiUrlAdminAcc}/GetWorkspaceCountByDateRange?from_date=${past_from}&to_date=${past_to}`),
        axios.get(`${apiUrlAdminAcc}/GetWorkspaceCountByDateRange?from_date=${before7_from}&to_date=${before7_to}`),
        axios.get(`${apiUrlAdminAcc}/GetCampaignsCountByDateRange?from_date=${past_from}&to_date=${past_to}`),
        axios.get(`${apiUrlAdminAcc}/GetCampaignsCountByDateRange?from_date=${before7_from}&to_date=${before7_to}`)
      ]);

      setLast30DaysUsers(last7Users.data.status === "Success" ? last7Users.data.totalUserCount : 0);
      setBefore30DaysUsers(before7Users.data.status === "Success" ? before7Users.data.totalUserCount : 0);

      setLast30DaysWorkspaces(last7Workspaces.data.status === "Success" ? last7Workspaces.data.totalWorkspaceCount : 0);
      setBefore30DaysWorkspaces(before7Workspaces.data.status === "Success" ? before7Workspaces.data.totalWorkspaceCount : 0);

      setLast30DaysCampaigns(last7Campaigns.data.status === "Success" ? last7Campaigns.data.totalCampaignsCount : 0);
      setBefore30DaysCampaigns(before7Campaigns.data.status === "Success" ? before7Campaigns.data.totalCampaignsCount : 0);
    } catch (error) {
      console.error("Error fetching past 7 days data:", error);
    }
    finally {
      setIsLoading(false);
    }
  };

  const fetchPast30DaysData = async () => {

    const past_from = format(subDays(new Date(), 30), "yyyy-MM-dd"); // Last 30 days (30 days ago to today)
    const past_to = format(new Date(), "yyyy-MM-dd");

    const before30_from = format(new Date("2000-01-01"), "yyyy-MM-dd"); // Start from the earliest available date
    const before30_to = format(subDays(new Date(), 30), "yyyy-MM-dd"); // Until 30 days ago

    try {
      setIsLoading(true);
      const [
        last30Users, before30Users,
        last30Workspaces, before30Workspaces,
        last30Campaigns, before30Campaigns
      ] = await Promise.all([
        axios.get(`${apiUrlAdminAcc}/GetUserCountByDateRange?from_date=${past_from}&to_date=${past_to}`),
        axios.get(`${apiUrlAdminAcc}/GetUserCountByDateRange?from_date=${before30_from}&to_date=${before30_to}`),
        axios.get(`${apiUrlAdminAcc}/GetWorkspaceCountByDateRange?from_date=${past_from}&to_date=${past_to}`),
        axios.get(`${apiUrlAdminAcc}/GetWorkspaceCountByDateRange?from_date=${before30_from}&to_date=${before30_to}`),
        axios.get(`${apiUrlAdminAcc}/GetCampaignsCountByDateRange?from_date=${past_from}&to_date=${past_to}`),
        axios.get(`${apiUrlAdminAcc}/GetCampaignsCountByDateRange?from_date=${before30_from}&to_date=${before30_to}`)
      ]);
 
      // Store last 30 days' data
      setLast30DaysUsers(last30Users.data.status === "Success" ? last30Users.data.totalUserCount : 0);
      setLast30DaysWorkspaces(last30Workspaces.data.status === "Success" ? last30Workspaces.data.totalWorkspaceCount : 0);
      setLast30DaysCampaigns(last30Campaigns.data.status === "Success" ? last30Campaigns.data.totalCampaignsCount : 0);

      // Store before 30 days' data (all previous data)
      setBefore30DaysUsers(before30Users.data.status === "Success" ? before30Users.data.totalUserCount : 0);
      setBefore30DaysWorkspaces(before30Workspaces.data.status === "Success" ? before30Workspaces.data.totalWorkspaceCount : 0);
      setBefore30DaysCampaigns(before30Campaigns.data.status === "Success" ? before30Campaigns.data.totalCampaignsCount : 0);

    } catch (error) {
      console.error("Error fetching past 30 days data:", error);
    }
    finally {
      setIsLoading(false);
    }
  };

  const GetChannelList = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${apiUrlAdvAcc}/GetChannelList`);

      if (response.data.status === "Success" && Array.isArray(response.data.channelList)) {
        // Filter only Whatsapp and Sms, and sort Whatsapp first
        const filteredChannels = response.data.channelList
          .filter((ch: any) =>
            ["WhatsApp", "SMS", "Click2Go-WA"].includes(ch.channel_name)
          )
          .map((ch: any) => ({
            channelName: ch.channel_name, // <- ensure proper casing
          }))
          .sort((a: any, b: any) => (a.channelName === "WhatsApp" ? -1 : 1));


        setChannels(filteredChannels);
      } else {
        console.log("Error fetching channels:", response);
        setChannels([]);
      }
    } catch (error) {
      console.error("Error fetching channels:", error);
      setChannels([]);
    } finally {
      setIsLoading(false);
    }
  };

  const dynamicChartConfig: ChartConfig = channels.reduce(
    (config, channel, index) => {
      config[channel.channelName] = {
        label: channel.channelName,
        color: `hsl(var(--chart-${index + 2}))`,
      };
      return config;
    },
    {} as ChartConfig
  );

  useEffect(() => {
    GetChannelList();
  }, []);
  // Call this function when the page loads
  useEffect(() => {
    fetchPast30DaysData();
  }, []);

  const fetchAmountSpent = async (currency: string, country: string, dateRange: DateRange | undefined) => {
    setIsLoading(true);
    try {

      const from_date = dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : format(subDays(new Date(), 30), "yyyy-MM-dd");
      const to_date = dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd");

      const response = await axios.get(`${apiUrlAdminAcc}/GetTotalAmountSpentChart?currencyName=${currency}&countryName=${country}&from_date=${from_date}&to_date=${to_date}`);
      if (response.data.status === "Success") {
        console.log("Ad Spend Response:", response.data);
        const formattedChartData = response.data.chartData.map((item: any) => ({
          date: format(new Date(item.date), "yyyy-MM-dd"),
          SMS: item.dailySmsAmount ?? 0,
          WhatsApp: item.dailyWhatsappAmount ?? 0,
          "Click2Go-WA": item.dailyClick2goAmount ?? 0,
        }));
        setAmountSpent(response.data.totalCombinedAmountInDateRange.totalCombinedAmountInDateRange.toLocaleString());
        setAdSpendChartData({ chartData: formattedChartData });
      } else {
        console.error("Failed to fetch ad spend:", response.data.status_Description);
        setAmountSpent(0);
      }
    } catch (error) {
      console.error("Error fetching ad spend data:", error);
      setAmountSpent(0);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (selectedCurrency && selectedDateRangeForAdSpend) {
      const [currencyName, countryName] = selectedCurrency.split("-");
      fetchAmountSpent(currencyName, countryName, selectedDateRangeForAdSpend);
    }
  }, [selectedCurrency, selectedDateRangeForAdSpend]); // ✅ API calls when currency or date range changes


  const handleCurrencyChange = (value: string) => {
    setSelectedCurrency(value);
    setIsCountrySelected(true);
    setAmountSpent(0);
    const currencyName = value.split("-")[0]; // This will extract 'USD' from 'USD-Canada'
    const countryName = value.split("-")[1]; // This will extract 'Canada' from 'USD-Canada'

    if (fetchAmountSpent && selectedDateRangeForAdSpend) {
      fetchAmountSpent(currencyName, countryName, selectedDateRangeForAdSpend);
    }
  };

  const calculatePercentageChange = (last: number, before: number, date?: DateRange, timeRange?: string) => {
    let type = "last month"; // Default is month
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

    if (!last || last === 0) return `+0% change for ${type}`;
    if (!before || before === 0) return `+0% change for ${type}`; // Avoid division by zero
    const change = (last / before) * 100;
    return `${change > 0 ? "+" : ""}${change.toFixed(1)}% change for ${type}`;
  };

  useEffect(() => {
    setIsMonth(true);
    setTimeRange("30d");
    byMonthData();
    fetchPast30DaysData();
  }, []);

  useEffect(() => {
      if (selectedView === "week" || selectedView === "month") {
        setDate(undefined);
      }
    }, [selectedView]);

  return chartData ? (
    <div className="flex-col w-full overflow-y-auto">
      <div className="flex mt-[-15px] justify-end gap-2">
        <div>
          {/* <DatePickerWithRange /> */}
          <DatePickerWithRange
            setChartData={setChartData}
            fetchData={byMonthData}
            setUserCount={setUserCount}
            setCampaignCount={setCampaignsCount}
            setWorkspaceCount={setWorkspaceCount}
            setSelectedDateRangeForAdSpend={setSelectedDateRangeForAdSpend}
            setAdSpendDescription={setAdSpendDescription}
            setMessageSentDescription={setMessageSentDescription}
            setDate={setDate}
            date={date}
            setSelectedView={setSelectedView}
            setBefore30DaysUsers={setBefore30DaysUsers}
            setLast30DaysUsers={setLast30DaysUsers}
            setLast30DaysWorkspaces={setLast30DaysWorkspaces}
            setBefore30DaysWorkspaces={setBefore30DaysWorkspaces}
            setLast30DaysCampaigns={setLast30DaysCampaigns}
            setBefore30DaysCampaigns={setBefore30DaysCampaigns}
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
              let dateRange: DateRange | undefined;

              if (value === "week") {
                setIsWeek(true);
                setTimeRange("7d");
                setDate(undefined);
                byWeekData();
                fetchPast7DaysData();
                dateRange = date_Week; // ✅ Set date range to past 7 days
                setAdSpendDescription("Showing total ad spend for the last week");
                setMessageSentDescription("Showing total messages sent per week");
              }
              else if (value === "month") {
                setIsMonth(true);
                setTimeRange("30d");
                setDate(undefined);
                byMonthData();
                fetchPast30DaysData();
                dateRange = date_Month; // ✅ Set date range to past 30 days
                setAdSpendDescription("Showing total ad spend for the last month");
                setMessageSentDescription("Showing total messages sent per month");
              }
              else {
                setIsWeek(false);
                setIsMonth(false);
                setTimeRange("90d");
                return; // Exit if no valid selection
              }

              // ✅ Update selectedDateRangeForAdSpend state
              setSelectedDateRangeForAdSpend(dateRange);

              // ✅ If a country is selected, call fetchAmountSpent
              if (selectedCurrency) {
                const [currencyName, countryName] = selectedCurrency.split("-");
                fetchAmountSpent(currencyName, countryName, dateRange);
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
        <CardComponent title="Users" value={userCount} change={calculatePercentageChange(last30DaysUsers, before30DaysUsers, date, timeRange)} />
        <CardComponent title="Workspaces" value={workspaceCount} change={calculatePercentageChange(last30DaysWorkspaces, before30DaysWorkspaces, date, timeRange)} />
        <CardComponent title="Campaigns" value={campaignsCount} change={calculatePercentageChange(last30DaysCampaigns, before30DaysCampaigns, date, timeRange)} />
        <CardComponent
          title="Ad Spend"
          value={isCountrySelected ? `${selectedCurrency.split("-")[0]} ${amountSpent}` : " "}
          change=" "
          selectedCurrency={selectedCurrency}
          setSelectedCurrency={setSelectedCurrency}
          isCountrySelected={isCountrySelected}
          setIsCountrySelected={setIsCountrySelected}
          amountSpent={amountSpent}
          selectedDateRangeForAdSpend={selectedDateRangeForAdSpend}
          fetchAmountSpent={fetchAmountSpent}
          setAmountSpent={setAmountSpent}
          handleCurrencyChange={(value) => {
            setSelectedCurrency(value);
            setIsCountrySelected(true);
            setAmountSpent(0);

            const [currencyName, countryName] = value.split("-");
            fetchAmountSpent(currencyName, countryName, selectedDateRangeForAdSpend);
          }}
        />
      </div>
      <DashChart data={adSpendChartData?.chartData || []} setTimeRange={setTimeRange} timeRange={timeRange} isWeek={isWeek} adSpendDescription={adSpendDescription} dynamicChartConfig={dynamicChartConfig} channels={channels}/>
      <SecondDashChart Data={chartData?.chartData || []} setTimeRange={setTimeRange} timeRange={timeRange} isWeek={isWeek} messageSentDescription={messageSentDescription} dynamicChartConfig={dynamicChartConfig} channels={channels}/>
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
export default AdminHome;
