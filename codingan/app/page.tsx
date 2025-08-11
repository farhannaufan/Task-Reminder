"use client";

import { useEffect } from "react";
import Drawer from "./components/layouts/Drawer";
import Footer from "./components/layouts/Footer";
import Navbar from "./components/layouts/Navbar";
import Announcement from "./components/sections/Announcement";
import CourseOverview from "./components/sections/CourseOverview";
import News from "./components/sections/News";
import Reminder from "./components/sections/Reminder";
import Timeline from "./components/sections/Timeline";

export default function Home() {
  return (
    <>
      <Navbar />
      <Drawer />
      <Reminder />
      <Announcement />
      <News />
      <Timeline />
      <CourseOverview />
      <Footer />
    </>
  );
}
