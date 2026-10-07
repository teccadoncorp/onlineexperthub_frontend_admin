"use client";

import { Children, isValidElement, type ReactNode } from "react";
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Col,
  Descriptions,
  Flex,
  Input,
  Layout,
  Listy,
  Menu,
  Radio,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Timeline,
  Typography,
} from "antd";

export {
  Alert,
  Button,
  Card,
  Checkbox,
  Col,
  Flex,
  Menu,
  Radio,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Timeline,
};

export const AppLayout = Layout;
export const InputBox = Input;
export const TextArea = Input.TextArea;
export const Header = Layout.Header;
export const TopBar = Layout.Header;
export const Content = Layout.Content;
export const FooterBar = Layout.Footer;
export const Sider = Layout.Sider;
export const Title = Typography.Title;
export const Text = Typography.Text;
export const Paragraph = Typography.Paragraph;
export const LinkText = Typography.Link;
export const DescriptionsList = Descriptions;
export const DescriptionsItem = Descriptions.Item;

export function ItemList({ children }: { children?: ReactNode }) {
  const items = Children.toArray(children)
    .filter(isValidElement)
    .map((node, index) => ({ id: String(node.key ?? index), node }));
  if (items.length === 0) return null;
  return <Listy items={items} rowKey="id" itemRender={(item) => item.node} />;
}

export function ListItem({
  children,
  extra,
  actions,
}: {
  children?: ReactNode;
  extra?: ReactNode;
  actions?: ReactNode[];
}) {
  return (
    <Flex align="center" justify="space-between" gap={12} style={{ padding: "12px 0" }}>
      <div style={{ minWidth: 0, flex: 1 }}>{children}</div>
      {extra}
      {actions?.length ? <Space>{actions}</Space> : null}
    </Flex>
  );
}

export function ListItemMeta({ title, description }: { title?: ReactNode; description?: ReactNode }) {
  return (
    <Flex vertical gap={4}>
      <span>{title}</span>
      {description ? <Text type="secondary">{description}</Text> : null}
    </Flex>
  );
}
