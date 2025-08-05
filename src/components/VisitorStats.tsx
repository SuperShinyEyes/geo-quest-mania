import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface VisitorStatsData {
  now_count: number;
  today_count: number;
  all_time_count: number;
}

export const VisitorStats = () => {
  const [stats, setStats] = useState<VisitorStatsData>({
    now_count: 0,
    today_count: 0,
    all_time_count: 0,
  });

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase.rpc('get_visitor_stats');
      if (error) {
        console.error('Error fetching visitor stats:', error);
        return;
      }
      if (data && data.length > 0) {
        setStats({
          now_count: data[0].now_count,
          today_count: data[0].today_count,
          all_time_count: data[0].all_time_count,
        });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Track visitor on component mount
  useEffect(() => {
    const trackVisitor = async () => {
      try {
        await supabase.rpc('increment_visitor_count');
      } catch (error) {
        console.error('Error tracking visitor:', error);
      }
    };

    trackVisitor();
    fetchStats();
  }, []);

  // Update "Now" count every 5 seconds
  useEffect(() => {
    const nowInterval = setInterval(() => {
      fetchStats();
    }, 5000);

    return () => clearInterval(nowInterval);
  }, []);

  // Update "Today" and "All time" every minute
  useEffect(() => {
    const minuteInterval = setInterval(() => {
      fetchStats();
    }, 60000);

    return () => clearInterval(minuteInterval);
  }, []);

  return (
    <div 
      className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 bg-background/95 backdrop-blur-sm border border-border rounded-lg px-4 py-3 shadow-lg"
      aria-label="Visitor statistics panel"
    >
      <div className="flex flex-col gap-1 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Now:</span>
          <span className="font-medium text-foreground">{stats.now_count}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Today:</span>
          <span className="font-medium text-foreground">{stats.today_count}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">All time:</span>
          <span className="font-medium text-foreground">{stats.all_time_count}</span>
        </div>
      </div>
    </div>
  );
};