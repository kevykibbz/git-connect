import React from "react";

interface AuthProps {
  children: React.ReactNode;
}
export default function AuthLayout({ children }: AuthProps) {
  const isAuthenticated = false;
  return (
    <div className="flex h-screen">
        {isAuthenticated ? (
          ""
        ) : (
          <React.Fragment>
            <section className="flex flex-1 justify-center items-center flex-col py-10">
              {children}
            </section>
            <img
              src="/assets/images/side-img.svg"
              alt="logo"
              className="hidden xl:block h-screen w-1/2 object-cover bg-no-repeat"
            />
          </React.Fragment>
        )}
    </div>
  );
}
