import React, { FC, useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../Components/ui/select";
import { Input } from "../../../Components/ui/input";
import { Label } from "../../../Components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../Components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../Components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../Components/ui/table";
import { useToast } from "../../../Components/ui/use-toast";
import { Toaster } from "../../../Components/ui/toaster";
import { Button } from "../../../Components/ui/button";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../State/store";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { CircularProgress } from "@mui/material";
import { useLocation } from "react-router-dom";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../Components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../Components/ui/card";
import { Textarea } from "../../../Components/ui/textarea";

interface ConnectSMSProps {
  open: boolean;
  handleClose: () => void;
  checkIsAlive: (serverId: number, channelId: number) => Promise<string>;
  connectionList: connectionList[] | undefined;
}

interface ShortCodes {
  code: string;
}

interface connectionList {
  id: number;
  channelName: string;
  type: string;
  host: string;
  port: number;
  systemId: string;
  password: string;
  created_date: string;

  // New TON & NPI fields
  bindingTON: number;
  bindingNPI: number;
  senderTON: number;
  senderNPI: number;
  destinationTON: number;
  destinationNPI: number;
  bindMode: number;
  systemType: string,
  addressRange: string,
  transportProtocol: string,
}

export const ConnectSMS: FC<{
  open: boolean;
  handleClose: () => void;
  checkIsAlive: (serverId: number, channelId: number) => Promise<string>;
  connectionList: connectionList[] | undefined;
}> = ({ open, handleClose, checkIsAlive, connectionList }) => {
  const smsUrl = useSelector((state: RootState) => state.authentication.smsUrl);
  const toast = useToast();
  const [apiUrlAdminAcc, setapiUrlAdminAcc] = useState("");
  const [connectionName, setConnectionName] = useState("");
  const [host, setHost] = useState("");
  const [port, setPort] = useState("");
  const [username, setUsername] = useState("");
  const [serverType, setServerType] = useState("SMPP");
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState("basic");
  const location = useLocation();
  const serverId = location.state?.serverId || " ";

  // New State Variables for TON & NPI
  const [bindingTON, setBindingTON] = useState(0);
  const [bindingNPI, setBindingNPI] = useState(0);
  const [senderTON, setSenderTON] = useState(5);
  const [senderNPI, setSenderNPI] = useState(0);
  const [destinationTON, setDestinationTON] = useState(1);
  const [destinationNPI, setDestinationNPI] = useState(1);
  const [shortCode, setShortCode] = useState([
    {
      code: "000",
    },
  ]);

  const [transportProtocol, setTransportProtocol] = useState("TCP");
  const [bindMode, setBindMode] = useState("Transceiver");
  const [addressRange, setAddressRange] = useState("");
  const [systemType, setSystemType] = useState("");
  const [dataCodingScheme, setDataCodingScheme] = useState("8");
  const [characterEncoding, setCharacterEncoding] = useState("UTF-8");
  const [serviceType, setServiceType] = useState("CMT");

  const connectionResolver=(item:string,value:string)=>{
    if(item==="bindMode"){
      if(value==="Transceiver"){
        return 3;
      }
      else if(value==="Receiver"){
        return 2;
      }
      else if(value==="Transmitter"){
        return 1;
      }
    }
  }

  const handleConnect = async (channelId: number) => {
    // Validate all fields before making API call
    if (!validateAllFields()) {
      toast.toast({
        title: "Validation Error",
        description: "Please fill all required fields before connecting.",
      });
      return; // Stop API call if validation fails
    }

    try {
      const response = await axios.post(
        `${smsUrl}/connect?ServerId=${serverId}`,
        {
          Host: host,
          Port: port,
          SystemId: username,
          Password: password,
          channelId: channelId,
          BindingTON: bindingTON, // Added Binding TON
          BindingNPI: bindingNPI, // Added Binding NPI
          BindMode: Number(connectionResolver("bindMode",bindMode)),
          SystemType: systemType,
          AddressRange: addressRange,
          UseSSL:transportProtocol==="TCP"?false:true
        }
      );

      if (response.data.status === "Success") {
        checkIsAlive(serverId, channelId);
        toast.toast({
          title: "Success",
          description: "Connected Successfully",
        });
      } else {
        toast.toast({
          title: "Failure",
          description: "Could not connect with SMPP server",
        });
      }
    } catch (error) {
      toast.toast({ title: "Failure", description: "API call failed" });
    }
  };

  const validateAllFields = () => {
    if (
      !connectionName.trim() ||
      !host.trim() ||
      !port.trim() ||
      !username.trim() ||
      !password.trim()
    ) {
      toast.toast({
        title: "Validation Error",
        description: "Please fill all required fields.",
      });
      return false;
    }
    return true;
  };

  const handleInputChange = (name: string, value: string | number) => {
    switch (name) {
      case "connectionName":
        setConnectionName(value as string);
        break;
      case "host":
        setHost(value as string);
        break;
      case "port":
        setPort(value as string);
        break;
      case "username":
        setUsername(value as string);
        break;
      case "password":
        setPassword(value as string);
        break;
      case "bindingTON":
        setBindingTON(Number(value));
        break;
      case "bindingNPI":
        setBindingNPI(Number(value));
        break;
      case "senderTON":
        setSenderTON(Number(value));
        break;
      case "senderNPI":
        setSenderNPI(Number(value));
        break;
      case "destinationTON":
        setDestinationTON(Number(value));
        break;
      case "destinationNPI":
        setDestinationNPI(Number(value));
        break;
    }
  };

  const createChannel = async () => {
    if (!validateAllFields()) return;

    try {

      const data = {

      };
    

      debugger
      console.log("The Connection Data : ",data);

      const response = await axios.post(`${smsUrl}/createconnection`, {
        ChannelName: connectionName || "", 
        Type: "SMPP",
        Host: host || "",
        Port: port || 0,
        SystemId: username || "",
        Password: password || "",
        ServerId: serverId || 0,
        BindingTON: bindingTON || 0,
        BindingNPI: bindingNPI || 0,
        SenderTON: senderTON || 0,
        SenderNPI: senderNPI || 0,
        DestinationTON: destinationTON || 0,
        DestinationNPI: destinationNPI || 0,
        ShortCodes: shortCode.length > 0 ? JSON.stringify(shortCode.map((sc) => sc.code)) : "[]",
        TransportProtocol: transportProtocol || "",
        BindMode: Number(connectionResolver("bindMode",bindMode)),
        AddressRange: addressRange || "",
        SystemType: systemType || "",
        DataCodingScheme: dataCodingScheme || 0,
        CharacterEncoding: characterEncoding || "",
        ServiceType: serviceType || "",
      });

      if (response.data.status === "Success") {
        toast.toast({
          title: "Success",
          description: "Server details stored successfully",
        });
        handleConnect(response.data.channel_id);
        handleClose();
      } else {
        toast.toast({
          title: "Error",
          description: "Failed to store server details",
        });
      }
    } catch (error) {
      console.error("Error storing server details:", error);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const addShortCode = () => {
    setShortCode([
      ...shortCode,
      {
        code: "000",
      },
    ]);
  };

  const removeShortCode = (index: number) => {
    const updatedShortCodes = shortCode.filter((_, i) => i !== index);
    setShortCode(updatedShortCodes);
  };

  const shortCodeChange = (
    index: number,
    field: keyof ShortCodes,
    value: string
  ) => {
    const updatedShortCode = [...shortCode];
    updatedShortCode[index] = {
      ...updatedShortCode[index],
      [field]: value,
    } as unknown as ShortCodes;
    setShortCode(updatedShortCode);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <Toaster />
      <DialogContent className="overflow-y-auto max-h-screen p-8">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full h-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          {/* Basic Configuration */}
          <TabsContent value="basic">
            <Card>
              <CardContent className="space-y-2 p-6 pt-8 flex flex-col gap-2">
                <div>
                  <Label>Connection Name</Label>
                  <Input
                    value={connectionName}
                    onChange={(e) =>
                      handleInputChange("connectionName", e.target.value)
                    }
                  />
                </div>

                <div className="flex flex-col gap-[6px]">
                  <Label
                    htmlFor="server-type"
                    className="text-14px font-medium text-[#020617]"
                  >
                    Connection Type
                  </Label>
                  <Select
                    value={serverType}
                    onValueChange={(value) => setServerType(value)}
                  >
                    <SelectTrigger className="text-gray-500 mt-2 flex items-center justify-between px-3">
                      <SelectValue
                        placeholder="Select Type of SMS Channel"
                        className="text-[#64748B] text-sm font-normal"
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        className="text-[#64748B] text-sm font-normal"
                        value="SMPP"
                      >
                        SMPP
                      </SelectItem>
                      <SelectItem
                        className="text-[#64748B] text-sm font-normal"
                        value="REST"
                      >
                        REST API
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {serverType === "SMPP" && (
                  <>
                    <div className="flex gap-2">
                      <div className="w-[50%]">
                        <Label>Host</Label>
                        <Input
                          value={host}
                          onChange={(e) =>
                            handleInputChange("host", e.target.value)
                          }
                        />
                      </div>

                      <div className="w-[50%]">
                        {" "}
                        <Label>Port</Label>
                        <Input
                          value={port}
                          onChange={(e) =>
                            handleInputChange("port", e.target.value)
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Username</Label>
                      <Input
                        value={username}
                        onChange={(e) =>
                          handleInputChange("username", e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <Label>Password</Label>
                      <Input
                        type="password"
                        value={password}
                        onChange={(e) =>
                          handleInputChange("password", e.target.value)
                        }
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label>Short Codes</Label>

                      {shortCode.map((code, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            autoFocus
                            value={code.code}
                            onChange={(e) =>
                              shortCodeChange(index, "code", e.target.value)
                            }
                            className="w-full"
                          />

                          {shortCode.length > 1 && (
                            <span>
                              <button onClick={() => removeShortCode(index)}>
                                ✕
                              </button>
                            </span>
                          )}
                        </div>
                      ))}

                      <div className="flex justify-end">
                        <Button
                          className="w-[30%] mt-0"
                          variant="link"
                          onClick={() => {
                            addShortCode();
                          }}
                        >
                          + Add
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={() => setActiveTab("advanced")}
                >
                  Next
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="advanced">
            <Card>
              <CardContent className="space-y-2 p-6 pt-8 flex flex-col gap-4">
                {serverType === "SMPP" && (
                  <>
                    <div className="flex flex-col gap-2">
                      <Label
                        htmlFor="binding-address"
                        className="text-14px font-medium text-[#020617]"
                      >
                        Binding Address
                      </Label>

                      <div
                        className="flex w-full items-center gap-2"
                        id="binding-address"
                      >
                        <Label
                          htmlFor="binding-address"
                          className="text-14px font-medium text-[#020617]"
                        >
                          TON
                        </Label>
                        <Input
                          id="binding-address"
                          type="number"
                          value={bindingTON}
                          onChange={(e) =>
                            handleInputChange("bindingTON", e.target.value)
                          }
                          className="text-[14px] font-normal placeholder:text-[#64748B] w-[47%]"
                        />

                        <Label
                          htmlFor="binding-address"
                          className="text-14px font-medium text-[#020617]"
                        >
                          NPI
                        </Label>
                        <Input
                          id="binding-address"
                          type="number"
                          value={bindingNPI}
                          onChange={(e) =>
                            handleInputChange("bindingNPI", e.target.value)
                          }
                          className="text-[14px] font-normal placeholder:text-[#64748B] w-[47%]"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label
                        htmlFor="binding-address"
                        className="text-14px font-medium text-[#020617]"
                      >
                        Sender Address
                      </Label>

                      <div
                        className="flex w-full items-center gap-2"
                        id="binding-address"
                      >
                        <Label
                          htmlFor="binding-address"
                          className="text-14px font-medium text-[#020617]"
                        >
                          TON
                        </Label>
                        <Input
                          id="binding-address"
                          type="number"
                          value={senderTON}
                          onChange={(e) =>
                            handleInputChange("senderTON", e.target.value)
                          }
                          className="text-[14px] font-normal placeholder:text-[#64748B]"
                        />

                        <Label
                          htmlFor="binding-address"
                          className="text-14px font-medium text-[#020617]"
                        >
                          NPI
                        </Label>
                        <Input
                          id="binding-address"
                          type="number"
                          value={senderNPI}
                          onChange={(e) =>
                            handleInputChange("senderNPI", e.target.value)
                          }
                          className="text-[14px] font-normal placeholder:text-[#64748B]"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label
                        htmlFor="binding-address"
                        className="text-14px font-medium text-[#020617]"
                      >
                        Destination Address
                      </Label>

                      <div
                        className="flex w-full gap-2 items-center"
                        id="binding-address"
                      >
                        <Label
                          htmlFor="binding-address"
                          className="text-14px font-medium text-[#020617]"
                        >
                          TON
                        </Label>
                        <Input
                          id="binding-address"
                          type="number"
                          value={destinationTON}
                          onChange={(e) =>
                            handleInputChange("destinationTON", e.target.value)
                          }
                          className="text-[14px] font-normal placeholder:text-[#64748B] w-[47%]"
                        />

                        <Label
                          htmlFor="binding-address"
                          className="text-14px font-medium text-[#020617]"
                        >
                          NPI
                        </Label>
                        <Input
                          id="binding-address"
                          type="number"
                          value={destinationNPI}
                          onChange={(e) =>
                            handleInputChange("destinationNPI", e.target.value)
                          }
                          className="text-[14px] font-normal placeholder:text-[#64748B] w-[47%]"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label className="text-14px font-medium text-[#020617]">
                        Transport Protocol
                      </Label>
                      <Select
                        value={transportProtocol}
                        onValueChange={setTransportProtocol}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Protocol" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TCP">TCP</SelectItem>
                          <SelectItem value="SSL">SSL</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label className="text-14px font-medium text-[#020617]">
                        Bind Mode
                      </Label>
                      <Select value={bindMode} onValueChange={setBindMode}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Bind Mode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Transceiver">
                            Transceiver
                          </SelectItem>
                          <SelectItem value="Receiver">Receiver</SelectItem>
                          <SelectItem value="Transmitter">
                            Transmitter
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label className="text-14px font-medium text-[#020617]">
                        Address Range
                      </Label>
                      <Input
                        type="text"
                        value={addressRange}
                        onChange={(e) => setAddressRange(e.target.value)}
                        className="text-[14px] font-normal placeholder:text-[#64748B]"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label className="text-14px font-medium text-[#020617]">
                        System Type
                      </Label>
                      <Input
                        type="text"
                        value={systemType}
                        onChange={(e) => setSystemType(e.target.value)}
                        className="text-[14px] font-normal placeholder:text-[#64748B]"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label className="text-14px font-medium text-[#020617]">
                        Service Type
                      </Label>
                      <Input
                        type="text"
                        value={addressRange}
                        onChange={(e) => setServiceType(e.target.value)}
                        className="text-[14px] font-normal placeholder:text-[#64748B]"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label className="text-14px font-medium text-[#020617]">
                        Data Coding Scheme
                      </Label>
                      <Input
                        type="text"
                        value={dataCodingScheme}
                        onChange={(e) => setDataCodingScheme(e.target.value)}
                        className="text-[14px] font-normal placeholder:text-[#64748B]"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label className="text-14px font-medium text-[#020617]">
                        Character Encoding
                      </Label>
                      <Select
                        value={characterEncoding}
                        onValueChange={setCharacterEncoding}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Encoding" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UTF-8">UTF-8</SelectItem>
                          <SelectItem value="UTF-16">UTF-16</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </CardContent>
              <CardFooter className="flex w-full flex-end justify-end">
                <Button
                  className="w-[30%] "
                  onClick={() => {
                    handleTabChange("basic");
                  }}
                >
                  Back
                </Button>

                <Button
                  className="w-[30%] ml-[40%]"
                  onClick={() => {
                    createChannel();
                  }}
                >
                  Submit
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};


const SmsConnections: FC = () => {
  const smsUrl = useSelector((state: RootState) => state.authentication.smsUrl);
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [openMenuRowId, setOpenMenuRowId] = useState<number | null>(null);
  const [connectionList, setConnectionList] = useState<connectionList[]>();
  const [connectionStatus, setConnectionStatus] = useState<
    Record<number, string>
  >({});
  const location = useLocation();
  const serverId = location.state?.serverId || " ";

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    getConnectionList();
    setOpen(false);
  };

  const dispatch = useDispatch();

  const checkIsAlive = async (
    serverId: number,
    channelId: number
  ): Promise<string> => {
    // Set initial loading status using channelId as key
    setConnectionStatus((prev) => ({ ...prev, [channelId]: "Loading..." }));
    try {
      const response = await axios.get(
        `${smsUrl}/isAlive?serverId=${serverId}&ConnectionId=${channelId}`
      );
      if (response.data.status === "Success") {
        setConnectionStatus((prev) => ({ ...prev, [channelId]: "Connected" }));
        return "Connected";
      } else {
        setConnectionStatus((prev) => ({
          ...prev,
          [channelId]: "Disconnected",
        }));
        return "Disconnected";
      }
    } catch (error) {
      setConnectionStatus((prev) => ({ ...prev, [channelId]: "Error" }));
      return "Error";
    }
  };

  const checkIsAliveForconnectionList = async (serverId: number) => {
    try {
      setConnectionStatus((prev) => ({ ...prev, [serverId]: "Loading..." }));
      const response = await axios.get(
        `${smsUrl}/isServerAlive?serverId=${serverId}`
      );
      if (response.data.status === "Success") {
        setConnectionStatus((prev) => ({ ...prev, [serverId]: "Connected" }));
      } else {
        setConnectionStatus((prev) => ({
          ...prev,
          [serverId]: "Disconnected",
        }));
      }
    } catch (error) {
      setConnectionStatus((prev) => ({ ...prev, [serverId]: "Disconnected" }));
      console.error(
        `Error checking connection status for server ${serverId}:`,
        error
      );
    }
  };

  const handleReconnect = async (
    channelId: number,
    host: string,
    port: number,
    username: string,
    password: string,
    bindingTON: number,
    bindingNPI: number,
    bindMode: number,
    systemType: string,
    addressRange: string,
    transportProtocol: string
  ) => {
    try {
      const response = await axios.post(
        `${smsUrl}/connect?ServerId=${serverId}`,
        {
          Host: host,
          Port: port,
          SystemId: username,
          Password: password,
          channelId: channelId,
          BindingTON: bindingTON, // Added Binding TON
          BindingNPI: bindingNPI, // Added Binding NPI
          BindMode: bindMode,
          SystemType: systemType,
          AddressRange: addressRange,
          UseSSL:transportProtocol==="TCP"?false:true
        }
      );

      if (response.data.status === "Success") {
        checkIsAlive(serverId, channelId);
        toast.toast({
          title: "Success",
          description: "Connected Successfully",
        });
      } else {
        toast.toast({
          title: "Failure",
          description: "Could not connect with SMPP server",
        });
      }
    } catch (error) {
      toast.toast({ title: "Failure", description: "SMPP Connection Failed" });
    }
  };

  const handleDisconnect = async (channelId: number) => {
    try {
      const response = await axios.post(
        `${smsUrl}/disconnect?serverId=${serverId}&ConnectionId=${channelId}`
      );
      if (response.data.status === "Success") {
        checkIsAlive(serverId, channelId);
        toast.toast({
          title: "Success",
          description: "Disconnected from SMPP server",
        });
        getConnectionList();
      } else {
        toast.toast({
          title: "Error",
          description: "Could not disconnect SMPP server",
        });
      }
    } catch (error) {
      console.error("API error in disconnecting from SMPP server: ", error);
    }
  };

  const handleMenuToggle = (rowId: number) => {
    debugger;
    setOpenMenuRowId(openMenuRowId === rowId ? null : rowId);
  };

  const getConnectionList = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${smsUrl}/getconnections?ServerId=${serverId}`
      );
      if (response.data.status === "Success") {
        setConnectionList(response.data.connectionList);
        response.data.connectionList.forEach((connection: connectionList) => {
          checkIsAlive(serverId, connection.id);
        });
      } else {
        console.error("List of connections not found");
      }
    } catch (error) {
      console.error("Error getting connection list: ", error);
    }
    setIsLoading(false);
  };

   useEffect(() => {
      const fetchConfig = async () => {
        try {
          const response = await fetch("/config.json");
          const config = await response.json();
          setapiUrlAdminAcc(config.ApiUrlAdminAcc);
        //  console.log("apiUrlAdminAcc:",apiUrlAdminAcc);
        } catch (error) {
          console.error("Error loading config:", error);
        }
      };
  
      fetchConfig();
    }, []);

  useEffect(() => {
    
    getConnectionList();
  }, []);

  return (
    <>
      {isLoading ? (
        <div className="flex items-center justify-center h-screen">
          <CircularProgress />
        </div>
      ) : (
        <div>
          <div className="fixed flex justify-end items-end right-0 top-[-15px] z-20 p-4">
            <Button
              onClick={handleOpen}
              className="w-36 text-sm font-thin h-[35px] mt-[10px] mb-[30px] form-button"
            >
              Create Connection
            </Button>
          </div>
          {connectionList ? (
            <div className="rounded-md border overflow-hidden">
              <div className="max-h-[60vh] overflow-y-auto">
                <Table className="rounded-xl border-[#020202]">
                  <TableHeader className="text-center text-[14px] font-medium">
                    <TableRow className="sticky top-0 bg-white z-10">
                      <TableHead>
                        <div className="flex items-center gap-6 justify-start cursor-pointer">
                          <span className="font-medium text-[14px] text-[#64748B]">
                            Connection Name
                          </span>
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center gap-2 justify-start">
                          <span className="font-medium text-[14px] text-[#64748B]">
                            Username
                          </span>
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-[14px] text-[#64748B]">
                            Host
                          </span>
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-[14px] text-[#64748B]">
                            Status
                          </span>
                        </div>
                      </TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody className="text-left text-[14px] font-normal text-[#020617]">
                    {connectionList.map((connection) => (
                      <TableRow key={connection.id}>
                        <TableCell className="flex justify-start py-4">
                          <div className="flex items-center gap-6">
                            <span
                              style={{
                                color: "#020617",
                                fontSize: "14px",
                                fontWeight: "400",
                              }}
                            >
                              {connection.channelName}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <span
                            style={{
                              color: "#020617",
                              fontSize: "14px",
                              fontWeight: "400",
                            }}
                          >
                            {connection.systemId || "N/A"}
                          </span>
                        </TableCell>
                        <TableCell className="py-4">
                          <span
                            style={{
                              color: "#020617",
                              fontSize: "14px",
                              fontWeight: "400",
                            }}
                          >
                            {connection.host || "N/A"}
                          </span>
                        </TableCell>
                        <TableCell className="py-4">
                          <span
                            style={{
                              color: "#020617",
                              fontSize: "14px",
                              fontWeight: "400",
                            }}
                          >
                            {connectionStatus[connection.id] || "Disconnected"}
                          </span>
                        </TableCell>
                        <TableCell className="py-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <DotsHorizontalIcon
                                onClick={() => handleMenuToggle(connection.id)}
                                className="cursor-pointer w-6 h-6"
                              />
                            </DropdownMenuTrigger>
                            {openMenuRowId === connection.id && (
                              <DropdownMenuContent
                                align="end"
                                className="w-20"
                              >
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleReconnect(
                                      connection.id,
                                      connection.host,
                                      connection.port,
                                      connection.systemId,
                                      connection.password,
                                      connection.bindingTON, // Added Binding TON
                                      connection.bindingNPI, // Added Binding NPI
                                      connection.bindMode,
                                      connection.systemType,
                                      connection.addressRange,
                                      connection.transportProtocol
                                    )
                                  }
                                >
                                  Reconnect
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleDisconnect(connection.id)
                                  }
                                >
                                  Disconnect
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            )}
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-screen">
              <Button
                onClick={handleOpen}
                className="w-36 text-sm font-thin h-[35px] mt-[10px] mb-[30px] form-button"
              >
                Create Connection
              </Button>
            </div>
          )}

          <ConnectSMS
            open={open}
            handleClose={handleClose}
            checkIsAlive={checkIsAlive}
            connectionList={connectionList}
          />
        </div>
      )}
    </>
  );
};

export default SmsConnections;
function setapiUrlAdminAcc(ApiUrlAdminAcc: any) {
  throw new Error("Function not implemented.");
}

