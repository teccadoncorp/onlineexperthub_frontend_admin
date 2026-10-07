"use client";

import { AntdRegistry } from "@ant-design/nextjs-registry";
import { App, ConfigProvider } from "antd";
import bnBD from "antd/locale/bn_BD";
import enUS from "antd/locale/en_US";

export function AntdProvider({ locale, children }: { locale: string; children: React.ReactNode }) {
  return (
    <AntdRegistry>
      <ConfigProvider
        locale={locale === "en" ? enUS : bnBD}
        theme={{
          token: {
            colorPrimary: "#4351AC",
            borderRadius: 12,
            fontFamily: "var(--font-sans), var(--font-noto), sans-serif",
          },
        }}
      >
        <App>{children}</App>
      </ConfigProvider>
    </AntdRegistry>
  );
}
