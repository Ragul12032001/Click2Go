import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { FiBell } from "react-icons/fi";
import { useSelector } from "react-redux";
import { RootState } from "../../State/store";
import CampaignIcon from '@mui/icons-material/Campaign';

interface Notification {
  unread: boolean;
  id: number;
  campaignId: number;
  workspaceId: number;
  campaignName: string;
  statusMark: string;
  notificationType: string;
  createdAt: string;
  notificationData: {
    ChannelName?: string;
    CampaignName?: string;
    [key: string]: string | undefined;
  };
  role: string;
}


interface NotificationBellProps {
  workspaceId: number | null;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ workspaceId }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const apiUrlAdvAcc = useSelector((state: RootState) => state.authentication.apiURL);

  useEffect(() => {
    if (!workspaceId || !apiUrlAdvAcc) return;

    const fetchLiveCampaigns = async () => {
      try {
        console.log("🔹 Fetching Live Campaigns...");
        const response = await axios.get(`${apiUrlAdvAcc}/GetCampaignNotifications?workspaceId=` + workspaceId);
        const campaignNotifications: Notification[] = response.data.notifications.filter((n: any) => n.role?.toLowerCase() === "advertiser") 
        .map((campaign: any) => ({
          id: campaign.id,
          campaignId: campaign.campaignId,
          workspaceId: campaign.workspaceId,
         // campaignName: campaign.campaignName,
          unread: campaign.statusMark === "Unread",  
          statusMark: campaign.statusMark,
          notificationType: campaign.notificationType,
          createdAt: campaign.createdAt,
          notificationData: campaign.notificationData || {},
          role: campaign.role
        }));

        const unreadNotifications = campaignNotifications.filter((n) => n.unread);
        setNotifications(campaignNotifications);
        setUnreadCount(unreadNotifications.length);
      } catch (error) {
        console.error(" Error fetching campaign notifications:", error);
      }
    };

    const interval = setInterval(fetchLiveCampaigns, 10000); //  Fetch every 10 seconds
    fetchLiveCampaigns();

    return () => clearInterval(interval);
  }, [workspaceId, apiUrlAdvAcc]);

  const markAllAsRead = async () => {
    try {
      const unreadCampaigns = notifications.filter((n) => n.unread).map((n) => n.id);

      if (unreadCampaigns.length === 0) {
        console.log("No unread notifications to mark as read.");
        return;
      }

      console.log("Marking campaigns as read:", unreadCampaigns);

      await Promise.all(
        unreadCampaigns.map((id) =>
          axios.post(`${apiUrlAdvAcc}/MarkAdvertiserNotificationRead?id=${id}`)
        )
      );

      setNotifications([]);
      setUnreadCount(0);
      setShowNotifications(false);
    } catch (error) {
      console.error(" Error marking notifications as read:", error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications]);

  // const handleBellClick = () => {
  //   setShowNotifications(!showNotifications);
  // };

  const handleBellClick = () => {
    const nextState = !showNotifications;
    setShowNotifications(nextState);
  
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  
    if (nextState) {
      timeoutRef.current = setTimeout(() => {
        setShowNotifications(false);
      }, 10000);
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return (
    <div className="relative" ref={notificationRef}>
      {/*  Bell Icon Notification Count */}
      <div onClick={handleBellClick} className="cursor-pointer">
        <FiBell style={{ width: "16px", height: "16px", color: "#fff" }} />
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1 rounded-full min-w-[12px] h-[12px] flex items-center justify-center leading-none">
            {unreadCount}
          </span>
        )}
      </div>

      {/* Notification Dropdown */}
      {showNotifications && (
        <div className="z-30 mr-6 absolute mt-4 right-0 transform translate-x-12 w-64 min-w-[240px] bg-white border border-gray-300 rounded shadow-lg p-3 overflow-visible">
          {notifications.length === 0 ? (
            <p className="text-gray-500 text-xs text-center">You have no unread notifications</p>
          ) : (
        <ul className={`${expanded ? "max-h-48" : "max-h-[96px]"} overflow-y-auto pr-1 divide-y divide-gray-200`}>
      {notifications
        .filter((n) => n.role?.toLowerCase() === "advertiser")
        .slice(0, expanded ? undefined : 2)
        .map((notification) => {
          const messageValues = Object.values(notification.notificationData || {});
          const message = messageValues.length > 0 ? messageValues[0] : "You have a new notification.";

          return (
            <li
              key={notification.id}
              className={`flex items-start text-xs py-2 text-left ${
                notification.unread ? "font-semibold text-slate-900" : "text-slate-700"
              }`}
            >
              <CampaignIcon fontSize="small" className="text-green-500 mr-2 mt-[2px]" />
              <span className="leading-snug">{message}</span>
            </li>
          );
        })}
    </ul>
  )}
        
    {/* Show All / Show Less toggle */}
    {notifications.filter((n) => n.role?.toLowerCase() === "advertiser").length > 2 && (
      <div className="border-t border-gray-200 pt-2 text-center mt-2">
        <button
          className="text-xs text-green-600 hover:underline"
          onClick={() => setExpanded((prev) => !prev)}
        >
          {expanded ? "Show Less" : "Show All"}
        </button>
      </div>
    )}

    {/* Mark all as read - only after expanded */}
    {(
      notifications.filter((n) => n.role?.toLowerCase() === "advertiser").length <= 2 ||
      expanded
    ) &&
      notifications.filter((n) => n.role?.toLowerCase() === "advertiser" && n.unread).length > 0 && (
      <>
        <hr className="my-2" />
        <button
          className="w-full bg-blue-500 text-white py-1 rounded text-xs hover:bg-blue-600 transition form-button"
          onClick={markAllAsRead}
        >
          Mark all as read
        </button>
      </>
    )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
