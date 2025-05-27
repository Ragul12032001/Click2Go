import { FC, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../Components/ui/card";
import { Button } from "../../Components/ui/button";
import { useSelector } from "react-redux";
import { RootState } from "../../State/store";
import axios from "axios";
import { useToast } from "../../Components/ui/use-toast";
import { Toaster } from "../../Components/ui/toaster";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../Components/ui/table";
import { CaretSortIcon, DotsHorizontalIcon } from "@radix-ui/react-icons";
import { table } from "console";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../Components/ui/dropdown-menu";
import CircularProgress from "@mui/material/CircularProgress";
import { Badge } from "../../Components/ui/badge";

declare const FB: any; // Declare FB as a global object

export interface WhatsAppBusinessAccount {
  id: string;
  display_phone_number: string;
  verified_name: string;
  status: string; // Add more statuses if applicable
  quality_rating: string; // Add more ratings if needed
  search_visibility: string; // Add additional visibility statuses if applicable
  platform_type: string; // Add more platform types as necessary
  code_verification_status: string; // Add additional statuses if necessary
}

// Interface for Owner Business Info
export interface OwnerBusinessInfo {
  name: string;
  id: string;
}

// Interface for WhatsApp Owner Details Response
export interface WhatsappOwnerDetailsResponse {
  id: string;
  name: string;
  ownerBusinessInfo: OwnerBusinessInfo;
}

export interface WABA{
  wabaId: string;
  phoneId: string;
  Id:number;
}

const Whatsapp: FC = () => {
  const [wabaId, setWabaId] = useState('');
  const [phoneId, setPhoneId] = useState('');
  const [Id, setId] = useState(0);

  const [signInSts, setSignInSts] = useState("");
  const [loading, setLoading] = useState(true);
  const [isCheckingToken, setIsCheckingToken] = useState(true); 
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [tableData, setTableData] = useState<WhatsAppBusinessAccount[]>([]);
  const [connectStatus, setConnectStatus] = useState(false);
  const [whatsappOwnerDetails, setWhatsappOwnerDetails] =
    useState<WhatsappOwnerDetailsResponse | null>(null);
  const toast = useToast();
  const whatsappUrl = useSelector(
    (state: RootState) => state.authentication.apiURL
  );
  const emailId = useSelector(
    (state: RootState) => state.authentication.userEmail
  );
  const workspaceId = useSelector(
    (state: RootState) => state.authentication.workspace_id
  );
  const [openMenuRowId, setOpenMenuRowId] = useState<number | null>(null);
  // const [wabaDetails,setwabaDetails] = useState<{ wabaId: string;phoneId: string;Id:number;}>({wabaId:"",phoneId:"",Id:0});
  
  useEffect(() => {

    const initializeComponent = async () => {

      setIsCheckingToken(true);

      await checkTokenValidity();

      setIsCheckingToken(false);

    };

    

    initializeComponent();

  }, []);
  

  useEffect(() => {

    if (!isCheckingToken) { // Only run this effect after initial loading

      setTimeout(() => {

        checkTokenValidity();

      }, 500);

    }

  }, [connectStatus]);

  
  useEffect(() => {
    debugger
    if (signInSts !== "signup" && signInSts !== "addPhoneNumber") return;
  
    const handleMessage = (event: MessageEvent) => {
      if (
        event.origin !== "https://www.facebook.com" &&
        event.origin !== "https://web.facebook.com"
      ) {
        return;
      }
  
      try {
        const data = JSON.parse(event.data);
  
        if (data.type === "WA_EMBEDDED_SIGNUP" && data.event === "FINISH") {
          const { phone_number_id, waba_id } = data.data;
  
          setWabaId(waba_id);
          setPhoneId(phone_number_id);
          console.log(`waba_id: ${waba_id}, phone_id: ${phone_number_id}`);
  
          if (signInSts === "signup") {
            InsertWabaDetails(waba_id, phone_number_id);
          } else if (signInSts === "addPhoneNumber") {
            registerNumber(phone_number_id);
          }
        }
      } catch {
        console.log("Non-JSON Response received: ", event.data);
      }
    };
  
    window.addEventListener("message", handleMessage);
  
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [signInSts]);
  

  const afterLogin = async () => {
    await subscribeToWebhook();
    await checkTokenValidity();
  };

  // Facebook Login Callback
  const fbLoginCallback = (response: any) => {
    debugger
    if (response.status === "connected") {
      console.log("login callback initiated");
      console.log("login callback ended!");
    } else {
      console.error("User not logged in:", response);
    }
  };

  // Launch WhatsApp Signup
  const launchWhatsAppSignup = (mode: string) => {
    if (mode === "connect") {
      FB.login(fbLoginCallback, {
        config_id: "883567437114798",
        response_type: "code",
        override_default_response_type: true,
        extras: {
          setup: {},
          featureType: "",
          sessionInfoVersion: "2",
        },
      });
      setSignInSts("signup");
      return true;
    } else if (mode === "addPhoneNumber") {
      FB.login(fbLoginCallback, {
        config_id: "883567437114798",
        response_type: "code",
        override_default_response_type: true,
        extras: {
          setup: {},
          featureType: "",
          sessionInfoVersion: "2",
        },
      });
      setSignInSts("addPhoneNumber");
      return true;
    }
  };

  const subscribeToWebhook = async () => {
    try {
      const response = await axios.post(
        `${whatsappUrl}/SubscribeToWebhook?workspaceId=${workspaceId}`
      );
      if (response.data.status === "Success") {
        console.log("Webhook Subscribed Successfully");
      } else {
        console.error("Webhook Subscription failed");
      }
    } catch (error) {
      console.log("An error occurred during webhook subscription: ", error);
    }
  };

  const unsubscribeFromWebhook = async () => {
    try {
      const response = await axios.delete(
        `${whatsappUrl}/UnsubscribeFromWebhook?workspaceId=${workspaceId}`
      );
      if (response.data.status === "Success") {
        console.log("Webhook Unsubscribed Successfully");
      } else {
        console.error("Webhook Unsubscription failed");
      }
    } catch (error) {
      console.log("An error occurred during webhook unsubscription: ", error);
    }
  };

  const disconnectWhatsappAccount = async () => {
    try {
      setLoading(true);
      const response = await axios.delete(
        `${whatsappUrl}/DisconnectWhatsappAccount?WorkspaceId=${workspaceId}`
      );
      if (response.data.status === "Success") {
        toast.toast({
          title: "Success",
          description: "Disconnected Whatsapp Account Successfully",
        });
        setIsTokenValid(false);

        setConnectStatus(false);
      } else {
        toast.toast({
          title: "Error",
          description: "Error in Disconnecting WABA",
        });
      }
    } catch (error) {
      toast.toast({
        title: "Error",
        description: "Disconnect API Error",
      });

    }
    finally{
      setLoading(false);
    }
  };

  const checkTokenValidity = async () => {
    try {
      setLoading(true);
      // Check token validity
      const response = await axios.get(
        `${whatsappUrl}/IsWhatsappTokenValid?workspaceId=${workspaceId}`
      );
      console.log("status: " + response.data.status);

      if (response.data.status === "Success" && response.data.isValid) {

        setIsTokenValid(true);

        setConnectStatus(true);
        console.log("token validity: ", isTokenValid);
        // toast.toast({
        //   title: "Success",
        //   description: "Token is valid",
        // });
        // Fetch table data
        const TableData = await axios.get(
          `${whatsappUrl}/GetWhatsappPhoneNumbers?workspaceId=${workspaceId}`
        );
        if (TableData.data.status === "Success") {
          setTableData(TableData.data.data);
          console.log("table data: " + tableData);
        } else {
          toast.toast({
            title: "Error",
            description: "No phone numbers found",
          });
        }

        // Fetch WhatsApp owner details
        const whatsappOwnerResponse = await axios.get(
          `${whatsappUrl}/GetWhatsappOwnerDetails?workspaceId=${workspaceId}`
        );
        if (whatsappOwnerResponse.data.status === "Success") {
          setWhatsappOwnerDetails(whatsappOwnerResponse.data.data); // Single object
          console.log(
            "whatsapp owner details: ",
            whatsappOwnerResponse.data.data
          );
        } else {
          toast.toast({
            title: "Error",
            description: "No details found",
          });
        }
      } else {
        setIsTokenValid(false);
        setConnectStatus(false);
        console.log("token validity: ", isTokenValid);
      }
    } catch (error) {
      console.error("Error checking token validity:", error);
      toast.toast({
        title: "Error",
        description: "An error occurred",
      });
    }
    setLoading(false);
  };

  const registerNumber = async (phoneId: string) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${whatsappUrl}/RegisterWhatsappNumber?workspaceId=${workspaceId}&phoneId=${phoneId}`
      );
      if (response.data.status == "Success") {
        toast.toast({
          title: "Success",
          description: "Phone Number Registered Successfully",
        });
      } else {
        toast.toast({
          title: "Error",
          description: "Error Registering phone number",
        });
      }
    } catch (error) {
      toast.toast({
        title: "Error",
        description: "Api Error in registering phone number",
      });
    }
    setLoading(false);
  };

  const deRegisterNumber = async (phoneId: string) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${whatsappUrl}/DeRegisterWhatsappNumber?workspaceId=${workspaceId}&phoneId=${phoneId}`
      );
      if (response.data.status == "Success") {
        toast.toast({
          title: "Success",
          description: "Phone Number DeRegistered Successfully",
        });
      } else {
        toast.toast({
          title: "Error",
          description: "Error DeRegistering phone number",
        });
      }
    } catch (error) {
      toast.toast({
        title: "Error",
        description: "Api Error in deRegistering phone number",
      });
    }
    setLoading(false);
  };

  useEffect(()=>{
    if(wabaId!=="" && phoneId!=="" && Id!=0){
      console.log("phId: "+phoneId+" wabaID: "+wabaId+ "Id: "+Id);
    }
  },[wabaId,phoneId])

  const InsertWabaDetails = async (wabaid:string,phoneid:string) => {
    try {
      const response = await axios.post(
        `${whatsappUrl}/InsertWabaDetails`,
        {
          WabaId:wabaid,
          PhoneId:phoneid,
          EmailId: emailId,
          workspaceId: workspaceId,
        }
      );
      if (response.data.status === "Success") {
        toast.toast({
          title: "Success",
          description: "WABA account connected successfully",
        });
        setId(response.data.id);
        console.log("WABA account connected successfully");
        checkTokenValidity();
      } else {
        toast.toast({
          title: "Error",
          description: "WABA account connection failed",
        });
      }
    } catch (error) {
      toast.toast({
        title: "Error",
        description: "Error in connecting WABA account",
      });
      console.error("Error inserting waba details:", error);
    }
  };

  const handleMenuToggle = (rowId: number) => {
    setOpenMenuRowId(openMenuRowId === rowId ? null : rowId);
  };

  return (
    <>
      {isCheckingToken ? (
        <div className="flex flex-col items-center justify-center h-[500px]">
          <CircularProgress color="success" />
        </div>
      ) : !isTokenValid ? (
        <Card className="flex-col w-[593px]">
          <Toaster />
          <CardHeader className="w-full text-left p-[24px]">
            <CardTitle className="text-[14px] font-600">
              Connect or create your WhatsApp business account
            </CardTitle>
            <CardDescription className="text-[14px] font-400">
              Click the button below to start the WhatsApp installation flow.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-start">
            <Button
              className="p-2 h-[32px] w-[89px] mt-0 text-[14px] form-button"
              onClick={() => launchWhatsAppSignup("connect")}
            >
              Connect
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="fixed flex justify-end gap-4 mr-[26px] items-end right-[0px] top-[-12px] z-20 ">
            <Button
              variant={"outline"}
              className="w-[100px] border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
              onClick={() => {
                disconnectWhatsappAccount();
                checkTokenValidity();
              }}
            >
              Disconnect
            </Button>
            <Button
              className="w-auto form-button"
              onClick={() => {
                launchWhatsAppSignup("addPhoneNumber");
                checkTokenValidity();
              }}
            >
              Add Phone Number
            </Button>
          </div>
  
          <div className="flex flex-col gap-[1rem]">
            <Card className="flex-col w-full rounded-md">
              <Toaster />
              <CardHeader className="w-full text-left p-[24px]">
                <CardTitle className="text-[14px] font-600">Account Details</CardTitle>
                <CardDescription className="flex flex-col text-[14px] font-400 space-y-[6px]">
                  {whatsappOwnerDetails ? (
                    <>
                      <p>
                        Meta Business Manager Account ID:{" "}
                        {whatsappOwnerDetails.ownerBusinessInfo.id}
                      </p>
                      <p>
                        WhatsApp Business Account ID: {whatsappOwnerDetails.id}
                      </p>
                    </>
                  ) : (
                    <p>Loading WhatsApp owner details...</p>
                  )}
                </CardDescription>
              </CardHeader>
            </Card>
  
            <div className="rounded-md border gap-1">
              <Table
                className="rounded-xl whitespace-nowrap border-gray-200"
                style={{ color: "#020202", fontSize: "15px" }}
              >
                <TableHeader className="text-center text-[14px] font-medium">
                  <TableRow>
                    <TableHead>
                      <div className="flex items-center gap-6 justify-start cursor-pointer">
                        <input type="checkbox" />
                      </div>
                    </TableHead>
                    <TableHead className="text-left">
                      <div className="flex items-center gap-2 justify-start">
                        Phone number <CaretSortIcon />
                      </div>
                    </TableHead>
                    <TableHead className="text-left">
                      <div className="flex items-center gap-2 justify-start">
                        Display name <CaretSortIcon />
                      </div>
                    </TableHead>
                    <TableHead className="text-left">
                      <div className="flex items-center gap-2 justify-start">
                        Status <CaretSortIcon />
                      </div>
                    </TableHead>
                    <TableHead className="text-left">
                      <div className="flex items-center gap-2 justify-start">
                        Quality <CaretSortIcon />
                      </div>
                    </TableHead>
                    <TableHead className="text-left">
                      <div className="flex items-center gap-2 justify-start">
                        Message limit <CaretSortIcon />
                      </div>
                    </TableHead>
                    <TableHead className="text-left"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-left text-[14px] font-normal text-[#020617]">
                  {tableData.map((data) => (
                    <TableRow key={data.id}>
                      <TableCell className="py-4 text-left">
                        <input type="checkbox" className="accent-gray-700 bg-grey-700" />
                      </TableCell>
                      <TableCell className="py-4 text-left">
                        {data.display_phone_number}
                      </TableCell>
                      <TableCell className="py-4 text-left">{data.verified_name}</TableCell>
                      <TableCell className="py-4 text-left">{data.status}</TableCell>
                      <TableCell className="py-4 text-left">
                        <Badge
                          className={data.quality_rating === "GREEN" ? "" : ""}
                          style={{
                            backgroundColor:
                              data.quality_rating === "GREEN" ? "#479E98" : "#DFA548",
                          }}
                        >
                          {data.quality_rating}
                        </Badge>
                      </TableCell>
                      <TableCell></TableCell>
                      <TableCell>
                        <DotsHorizontalIcon className="cursor-pointer w-6 h-6" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
  
          {/* {loading && (
        <div className="flex flex-col items-center justify-center h-[500px]">
        <CircularProgress color="success" />
      </div>
)} */}


        </>
      )}
    </>
  );
  
};

export default Whatsapp;
