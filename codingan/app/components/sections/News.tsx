import Image from "next/image";
import React from "react";

const News = ({}) => {
  return (
    <div className="min-h-auto bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow-sm p-6">
          <Image
            src="/images/news.jpg"
            alt="Logo"
            width={0}
            height={0}
            sizes="100vw"
            className="w-full h-auto"
          ></Image>
        </div>
      </div>
    </div>
  );
};

export default News;
