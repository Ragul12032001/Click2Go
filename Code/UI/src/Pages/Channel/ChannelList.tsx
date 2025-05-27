import { useEffect, useState } from "react";
import { Card } from "../../Components/ui/card";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/src/State/store";
import axios from "axios";
import { Toaster } from "../../Components/ui/toaster";
import { useToast } from "../../Components/ui/use-toast"; // Added import for useToast
import CircularProgress from "@mui/material/CircularProgress/CircularProgress";

const ChannelList = () => {
  const [selectedChannel, setSelectedChannel] = useState<string>("");

  const [channels, setChannels] = useState<
    { channel_id: number; channel_name: string; channel_description: string }[]
  >([]);

  const navigate = useNavigate();
  const toast = useToast(); // Added toast hook
  const accountId = useSelector(
    (state: RootState) => state.authentication.account_id
  );
  const apiUrlAdminAcc = useSelector(
    (state: RootState) => state.authentication.adminUrl
  );

  const apiUrlAdvAcc = useSelector(
    (state: RootState) => state.authentication.apiURL
  );
  const workspaceId = useSelector(
    (state: RootState) => state.authentication.workspace_id
  );
  const workspaceName = useSelector(
    (state: RootState) => state.authentication.workspaceName
  );
  const emailId = useSelector(
    (state: RootState) => state.authentication.userEmail
  );

  const [isLoading, setIsLoading] = useState<boolean>(true);
  // Commented out unused state
  // const [isdialogOpen, setIsDialogOpen] = useState<boolean>(false);
  // const [checkedChannels, setCheckedChannels] = useState<CheckedChannel[]>([]);

  useEffect(() => {
    console.log("AdminUrl :", apiUrlAdminAcc);
    console.log("AcoountId :", accountId);
    console.log("WorkspaceId :", workspaceId);
    
    GetChannelList();
  }, []);

  const GetChannelList = async () => {
    try {
      console.log("Fetching Channel List...");

      const response = await axios.get(`${apiUrlAdvAcc}/GetChannelList`);

      if (
        response.data.status === "Success" &&
        Array.isArray(response.data.channelList)
      ) {
        setChannels(response.data.channelList);
        setIsLoading(false);
      } else {
        console.log("Error fetching channels:", response);
        setChannels([]);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error fetching channels:", error);
      setChannels([]);
      setIsLoading(false);
    }
  };

  // Modified to handle different channel types with specific behaviors
  const handleChannelClick = (channelName: string) => {
    setSelectedChannel(channelName);
    
    // Check the channel name and perform the corresponding action
    if (channelName.toLowerCase() === "sms") {
      // Show toast message for SMS
      toast.toast({
        title: "Channel Configuration",
        description: "SMS is already configured",
      });
    } 
    else if (channelName.toLowerCase() === "click2go-wa") {
      // Show toast message for Click2Go-WA
      toast.toast({
        title: "Channel Configuration",
        description: "Click2Go is already configured",
      });
    }
    else {
      // Default behavior for other channels (like WhatsApp)
      navigate("/navbar/" + channelName.toLowerCase());
    }
  };

  // Commented out permission request flow functions as they're not currently used
  /* 
  const handleClose = () => {
    setIsDialogOpen(false);
  };

  const SubmitRequest = async (channel: string) => {
    console.log("Channel :", channel);
    try {
      const payload = {
        workspaceId: workspaceId || 0,
        campaignId: 0,
        campaignName: "UnKnown",
        statusMark: "Unread",
        notificationType: "RequestingPermission",
        notificationData: {
          Message: `${workspaceName}-(${emailId}) is requesting access to ${channel}`,
        },
        role: "Admin",
      };
      console.log("payload :", payload);
      const response = await axios.post(
        `${apiUrlAdvAcc}/CreateNotification`,
        payload
      );

      if (response.data.status === "Success") {
        toast.toast({
          title: "Success",
          description: "Request submitted successfully.",
        });
      }
    } catch (e) {
      console.log("Error :", e);
      toast.toast({
        title: "Error Occurred",
        description: "An unexpected error occurred. Please try again later.",
      });
    }
  };

  const handleRequestSubmit = async (channel: string) => {
    console.log("Request Data :", channel);
    SubmitRequest(channel);
    setIsDialogOpen(false);
  };
  */

  return (
    <>
      {isLoading && (
        <div className="flex flex-col items-center justify-center h-[500px]">
          <CircularProgress color="success" />
        </div>
      )}

      <div className="flex flex-wrap gap-4 p-2 w-full">
        {[...channels].map((ch, idx) => (
          <Card
            key={idx}
            className={`w-[250px] p-[30px] relative cursor-pointer border ${
              selectedChannel === ch.channel_name
                ? "border-gray-300"
                : "border-gray-300"
            }`}
            onClick={() => handleChannelClick(ch.channel_name)}
          >
            <div className="flex w-full">
              <div>
                <h3 className="font-semibold font-[14px] text-[#020617] text-left flex w-full mb-2">
                  {ch.channel_name}
                </h3>
              </div>

              {/* Commented out unused check icon logic
              <div className="flex w-full justify-end absolute right-7 mt-1">
                {checkedChannels.some(
                  (data) => data.channelName === ch.channel_name
                ) ? (
                  <CheckIcon className="text-[#3A85F7] w-4 h-4 rounded-full border border-blue-500" />
                ) : (
                  <Cross1Icon className="text-[#E2E8F0] w-4 h-4 rounded-full border border-gray-200" />
                )}
              </div>
              */}
            </div>

            <p className="mt-2 text-[#64748B] font-normal text-[12px] h-[68px] text-left w-full">
              {ch.channel_description}
            </p>
          </Card>
        ))}

        <Toaster />

        {/* Commented out unused dialog component
        <Dialog open={isdialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="p-6 mx-auto">
            <DialogHeader>
              <DialogTitle className="text-18px font-semibold text-[#09090B]">
                Access Permission Required
              </DialogTitle>
              <DialogDescription className="text-14px font-medium text-[#71717A] mt-2">
                Access to this channel requires approval from an administrator.
                Would you like to submit a request for access?
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-4 flex-wrap">
              <Button
                className="px-4 py-2 w-auto"
                variant="outline"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                className="px-4 py-2 w-auto text-[#FAFAFA] bg-[#3A85F7] form-button"
                onClick={() => handleRequestSubmit(selectedChannel)}
              >
                Submit
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        */}
      </div>
    </>
  );
};

export default ChannelList;