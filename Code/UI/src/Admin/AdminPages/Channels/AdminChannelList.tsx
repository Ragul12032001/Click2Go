import { useState, useEffect } from "react";
import { CheckIcon, Cross1Icon } from "@radix-ui/react-icons";
import { Card } from "../../../Components/ui/card"; // Assuming you're using Shadcn's Card component
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/src/State/store";
import axios from "axios";
import { CircularProgress } from "@mui/material";

const AdminChannelList = () => {
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [channels, setChannels] = useState<{ channel_id: number; channel_name: string; channel_description: string }[]>([]);
  const apiUrlAdvAcc = useSelector((state: RootState) => state.authentication.apiURL);
  const location = useLocation();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // const channels = ["SMS", "WhatsApp"];
  const navigate = useNavigate();

  const GetChannelList = async () => {
    try {
      console.log("Fetching Channel List...");

      const response = await axios.get(`${apiUrlAdvAcc}/GetChannelList`);

      if (response.data.status === "Success" && Array.isArray(response.data.channelList)) {

        setChannels(response.data.channelList);
        setIsLoading(false);
      } else {
        console.log("Error fetching channels:", response);
        setChannels([]); // Prevent undefined errors
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error fetching channels:", error);
      setChannels([]);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    GetChannelList();
  }, []);
  return (
    <>
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-[500px]">
          <CircularProgress color="success" />
        </div>
      ) : (
        <div className="flex flex-wrap gap-4 p-2 w-full">
          {[...channels]
            .sort((a, b) => {
              // Priority channels: WhatsApp and SMS
              const priority = ["WhatsApp", "SMS"];
              const aPriority = priority.includes(a.channel_name) ? priority.indexOf(a.channel_name) : Infinity;
              const bPriority = priority.includes(b.channel_name) ? priority.indexOf(b.channel_name) : Infinity;

              // Sort WhatsApp and SMS to the top, rest in original order
              return aPriority - bPriority;
            })
            .map((ch, idx) => (
              <Card
                key={ch.channel_id}
                className={`w-[250px] p-[30px] relative cursor-pointer border ${selectedChannel?.toLowerCase() === ch.channel_name.toLowerCase() ? "border-gray-300" : "border-gray-300"
                  }`}

                onClick={() => {
                  const name = ch.channel_name.toLowerCase();

                  setSelectedChannel(ch.channel_name);

                   if (name.includes("whatsapp")) {
                    navigate("/adminNavbar/whatsapp", { state: { selectedLabel: "Channels" } });
                  } else if (name.includes("click2go-wa")){
                    navigate("/adminNavbar/click2gowa", { state: { selectedLabel: "Channels" } });
                  } else if (name.includes("sms")) {
                    navigate("/adminNavbar/sms", { state: { selectedLabel: "Channels" } });
                  } else {
                    console.log("The selected channel has no route.")
                  }
                }} 
              >
                {/* Content aligned to the left */}
                <div className="flex w-full">
                  <div>
                    <h3 className="font-semibold font-[14px] text-[#020617] text-left flex w-full mb-2">
                      {ch.channel_name}
                    </h3>
                  </div>
                  {/* <div className="flex w-full justify-end absolute right-7 mt-1">
                      <Cross1Icon className="text-[#E2E8F0] w-4 h-4 rounded-full border border-gray-200" />
                  </div> */}
                </div>

                {/* Description */}
                <p className="mt-2 text-[#64748B] font-normal text-[12px] h-[68px] text-left w-full">
                  {ch.channel_description}
                </p>
              </Card>
            ))}
        </div>
      )
      }
    </>
  )
};

export default AdminChannelList;
