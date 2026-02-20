"use client";

// import { Helmet } from 'react-helmet';
import { Helmet, HelmetProvider } from "react-helmet-async";
import { ReactNode } from "react";

type Props = {
  description?: string;
  children: ReactNode;
  title?: string;
};

const PageContainer = ({ title, description, children }: Props) => (
  <HelmetProvider>
    <div>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
      </Helmet>
      {children}
    </div>
  </HelmetProvider>
);

export default PageContainer;

