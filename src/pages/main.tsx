import React from "react";
import Mainlayout from "@/components/main-layout";
import { APP_NAME } from "@/lib/constants";


function Main() {


  return (
    <Mainlayout>
      <div className="flex flex-col h-full items-center justify-center">
        <h1 className="text-2xl font-bold">Welcome to {APP_NAME}</h1>
        <p>Get Started by uploading or downloading</p>
      </div>
    </Mainlayout>
  );
}

export default Main;