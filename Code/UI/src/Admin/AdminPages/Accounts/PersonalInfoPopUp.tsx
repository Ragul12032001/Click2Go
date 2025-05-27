import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogDescription,
} from "../../../Components/ui/PersonalInfoPopUpDialog";
import { Button } from "../../../Components/ui/button";
import { Switch } from "../../../Components/ui/switch";
import { useToast } from "../../../Components/ui/use-toast";

interface ViewAccountPopupProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  accountId: number;
  accountEmail: string;
  accountType: string;
}

interface Channel {
  channel_id: number;
  channel_name: string;
}

interface CheckedChannel {
  channelId: number;
  channelName: string;
}

const PersonalInfoPopup: React.FC<ViewAccountPopupProps> = ({
  isOpen,
  onOpenChange,
  accountId,
  accountEmail,
  accountType,
}) => {
  const [apiUrlAdvAcc, setApiUrlAdvAcc] = useState<string>("");
  const [apiUrlAdminAcc, setApiUrlAdminAcc] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [workspaceType, setWorkspaceType] = useState<string>("");
  const [channelList, setChannelList] = useState<Channel[]>([]);
  const [channelToggles, setChannelToggles] = useState<{
    [key: number]: boolean;
  }>({});
  const [availableChannels, setAvailableChannels] = useState<Channel[]>([]);
  const [checkedChannels, setCheckedChannels] = useState<CheckedChannel[]>([]);
  const [existingcheckedChannels, setExistingCheckedChannels] = useState<CheckedChannel[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);


  const toast = useToast();

  // Load configuration on mount
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch("/config.json");
        const config = await response.json();
        setApiUrlAdvAcc(config.ApiUrlAdvAcc); // Set the API URL from config
        setApiUrlAdminAcc(config.ApiUrlAdminAcc);
      } catch (error) {
        console.error("Error loading config:", error);
      }
    };
    loadConfig();
  }, []);

  useEffect(() => {
    if (!isOpen) return;
  
    if (checkedChannels.length > 0) {
      setChannelToggles((prev) => ({
        ...prev,
        ...Object.fromEntries(
          checkedChannels.map((channel) => [channel.channelId, true])
        ),
      }));
    }
  }, [checkedChannels]);
  

  useEffect(() => {
    if (isOpen && apiUrlAdvAcc && apiUrlAdminAcc && accountEmail) {
      const fetchData = async () => {
        console.log("Fetching Data :");
        setIsLoading(true);
        try {
          await Promise.all([
            GetPersonalInfo(),
            GetChannelList(),
            GetCheckedChannelsList(),
          ]);
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    } else {
      console.log("useEffect triggered. isOpen:", isOpen);
      console.log("Popup is closing, resetting state..."); // Debugging log

      setAvailableChannels([]);
      setCheckedChannels([]);
      setChannelToggles({});
      setFirstName("");
      setLastName("");
      setWorkspaceType("");
      // Restore pointer events after a short delay
      setTimeout(() => {
        document.body.style.pointerEvents = "";
      }, 500);
    }
    return;
  }, [isOpen]); // ✅ Only runs when `isOpen` changes

  const GetPersonalInfo = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching Personal Info...");
      const response = await axios.post(
        `${apiUrlAdvAcc}/GetPersonalinfoByEmail`,
        {
          UserEmail: accountEmail,
        }
      );

      if (
        response.data.status === "Success" &&
        response.data.personalInfoList.length > 0
      ) {
        const user = response.data.personalInfoList[0];
        setFirstName(user.firstName);
        setLastName(user.lastName);
        setWorkspaceType(user.workspace_type);
      } else {
        console.log("No personal info found for the given email.");
      }
    } catch (error) {
      console.error("Error fetching personal info:", error);
    }
  };

  const GetChannelList = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching Channel List...");

      const response = await axios.get(`${apiUrlAdvAcc}/GetChannelList`);

      if (response.data?.channelList) {
        setChannelList(response.data.channelList);
        console.log("Channel List:", response.data.channelList);
      } else {
        console.log("No channel list available in response.");
        setChannelList([]); // ✅ Ensure empty list is set to prevent errors
      }
    } catch (error) {
      console.error("Error fetching channel list:", error);
    }
  };

  const GetCheckedChannelsList = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching Checked Channels...");

      const response = await axios.get(
        `${apiUrlAdminAcc}/GetAdvertiserChannels?workspaceId=${accountId}`
      );

      if (
        response.data.status === "Success" &&
        Array.isArray(response.data.channels)
      ) {
        console.log("Checked Channels Response:", response.data.channels);
        setCheckedChannels(response.data.channels);
        setExistingCheckedChannels(response.data.channels);
      } else {
        console.log("Error fetching checked channels:", response);
        setCheckedChannels([]); // ✅ Prevent undefined errors
      }
    } catch (error) {
      console.error("Error fetching checked channels:", error);
      setCheckedChannels([]);
    }
  };

  const handleDialogChange = (event: any) => {
    onOpenChange(event.target?.checked || false);
  };

  // const handleToggle = (channel_id: number) => {
  //   console.log("Handle Toggle :", channel_id);

  //   setChannelToggles((prev) => {
  //     const updatedToggles = {
  //       ...prev,
  //       [channel_id]: !prev[channel_id], // ✅ Toggle the state correctly
  //     };
  
      // // Update available channels based on the checked state
      // const updatedAvailableChannels = Object.entries(updatedToggles)
      //   .filter(([_, isChecked]) => isChecked) // ✅ Only get checked channels
      //   .map(([id]) => channelList.find((c) => c.channel_id === Number(id))!)
      //   .filter(Boolean); // ✅ Remove undefined values

      // console.log("Updated Channels :" , updatedAvailableChannels);
      // const updatedlist = updatedAvailableChannels.map((data) => ({
      //   channelId: data.channel_id,
      //   channelName: data.channel_name,
      // }));
      
  //     console.log(updatedlist);
  //     setCheckedChannels(updatedlist);
  //     setAvailableChannels(updatedAvailableChannels);
  
  //     return updatedToggles;
  //   });
  // };

  const sendNotification = async (channel: string) => {
    try {        
        const payload = {
          workspaceId: accountId || 0,
          campaignId: 0,
          campaignName: "UnKnown",
          statusMark: "Unread",
          notificationType: "RequestGranted",
          notificationData: {
            ChannelMessage: `${channel} Permisson Granted`,
            ChannelName: {channel}
          }
        };
        console.log("payload :", payload);
        const response = await axios.post(`${apiUrlAdminAcc}/CreateNotificationForAdvertiser`, payload);
  
        if (response.data.status === "Success") {
          toast.toast({
            title: "Success",
            description: "Request submitted successfully."
          });
        }
      } catch (e) {
        console.log("Error :", e);
        toast.toast({
          title: "Error Occurred",
          description: "An unexpected error occurred. Please try again later."
        });
      }
    };
  

  // Function to save checked channels when clicking "Apply"
  // const handleApply = () => {
  //   console.log("Saved Channels:", availableChannels);
  //   const Channels = availableChannels.map((data) => data.channel_name.trim().toLowerCase());
  //   console.log("Channels :", Channels);
    
  //   UpdateChannels(Channels);
    
  //   const oldchannels = existingcheckedChannels.map((data) => data.channelName.trim().toLowerCase());
  //   console.log("Old Channels:", oldchannels);
    
  //   const newlychangedchannels: string[] = Channels.filter(
  //     (data) => !oldchannels.includes(data)
  //   );
    
  //   console.log("Newly changed Channels:", newlychangedchannels);
  //   sendNotification(newlychangedchannels.toString());
    
  // };

  const UpdateChannels = async (ChannelsData: string[]) => {
    try {
      setIsSubmitting(true);
      const response = await axios.post(
        `${apiUrlAdminAcc}/InsertAdvertiserChannels`,
        {
          WorkspaceId: accountId,
          Channels: ChannelsData,
        }
      );
      if (response.data.status === "Success") {
        toast.toast({
          title: "Success",
          description: "Channels updated successfully.",
        });
        setIsSubmitting(false);
      } else {
        toast.toast({
          title: "Failed",
          description: "Failed to update.",
        });
        setIsSubmitting(false);
      }
    } catch (e) {
      console.log("Error :", e);
      toast.toast({
        title: "Error",
        description: "Something went wrong, Please try again",
      });
      setIsSubmitting(false);
    } finally {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogChange}>
      <DialogContent className="w-full max-w-xl max-h-screen">
        <DialogHeader className="flex items-center mt-2">
          <DialogTitle>Account Details</DialogTitle>
        </DialogHeader>
        {/* <div className="flex flex-col flex-grow gap-2"> */}
          <div className="ml-4 flex flex-col flex-grow gap-2 m-2">
            <div className="flex flex-row ">
              <div className="basis-1/2 text-[14px] font-medium text-[#020617]">
                Account ID
              </div>
              <div className="basis-1/2  text-[14px] font-normal">
                : {accountId}
              </div>
            </div>

            <div className="flex flex-row flex-grow  w-auto">
              <div className="basis-1/2 shrink-0 text-[14px] font-medium text-[#020617]">
                Account Email
              </div>
              <div className="basis-1/2 flex-grow text-[14px] font-normal break-all">
                : {accountEmail}
              </div>
            </div>

            <div className="flex flex-row">
              <div className="basis-1/2 text-[14px] font-medium text-[#020617]">
                First Name
              </div>
              <div className="basis-1/2 text-[14px] font-normal">
                : {firstName || "Loading..."}
              </div>
            </div>
            <div className="flex flex-row">
              <div className="basis-1/2 text-[14px] font-medium text-[#020617]">
                Last Name
              </div>
              <div className="basis-1/2 text-[14px] font-normal">
                : {lastName || "Loading..."}
              </div>
            </div>

            <div className="flex flex-row">
              <div className="basis-1/2 text-[14px] font-medium text-[#020617]">
                Workspace Type
              </div>
              <div className="basis-1/2 text-[14px] font-normal">
                : {workspaceType || "Loading..."}
              </div>
            </div>
          </div>

          {/* {accountType === "Advertiser" ? (
            <div className="flex flex-row gap-4 p-4 border rounded-lg shadow-lg w-full">
              {/* Left Side - Channels Header (Smaller Width) */}
              {/* <div className="flex basis-1/2 justify-center items-center font-semibold text-lg bg-gray-100 p-4 rounded-lg w-32">
                Channels
              </div> */}

              {/* Right Side - Scrollable Channel List with Toggles
              <div className="basis-1/2 h-40 overflow-y-auto space-y-3 p-2 border rounded-lg shadow-sm bg-gray-50 w-full">
                {isLoading && checkedChannels.length === 0 ? (
                  <div className="flex h-full justify-between items-center p-3">
                    <span className="text-[14px] font-medium text-[#020617]">
                      Loading channels...
                    </span>
                  </div>
                ) : (
                  channelList.map((channel) => (
                    <div
                      key={channel.channel_id}
                      className="flex justify-between items-center bg-white p-3 rounded-lg shadow"
                    >
                      <span className="text-[14px] font-medium text-[#020617]">
                        {channel.channel_name}
                      </span>
                      <Switch
                        checked={
                          channelToggles[channel.channel_id] ||
                          checkedChannels.some(
                            (data) => data.channelId === channel.channel_id
                          )
                        }
                        // onCheckedChange={() => handleToggle(channel.channel_id)}
                      />
                    </div>
                  ))
                )}
              </div>
            </div> */}
          {/* ) : null */} 

{/* <div className="flex justify-center flex-wrap">
  {accountType === "Advertiser" ? (
    <Button
      className="mb-2 py-1 w-full bg-[#3A85F7] text-[14px] font-medium text-[#FAFAFA]"
      onClick={handleApply}
      disabled={isSubmitting}
    >
      Apply
    </Button> */}
  {/* ) : ( */}
    <Button
      className="mb-2 py-1 w-full bg-[#3A85F7] text-[14px] font-medium text-[#FAFAFA] form-button"
      onClick={() => onOpenChange(false)}  // Close button
    >
      Close
    </Button>
  {/* )} */}
{/* </div> */}

        {/* </div> */}
      </DialogContent>
    </Dialog>
  );
};

export default PersonalInfoPopup;