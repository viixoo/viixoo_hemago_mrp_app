import { Box, Flex, Icon, Text } from "@chakra-ui/react";
import { Link as RouterLink } from "@tanstack/react-router";
import { AiOutlineProduct, AiFillProduct } from "react-icons/ai";
import { LuListCollapse } from "react-icons/lu";
import { useState } from "react";
import type { IconType } from "react-icons/lib";

const items = [
  { icon: AiOutlineProduct, title: "Órdenes de fabricación", path: "/items" },
  { icon: AiFillProduct, title: "Órdenes de trabajo", path: "/workorders" },
];

interface SidebarItemsProps {
  onClose?: () => void;
}

interface Item {
  icon: IconType;
  title: string;
  path: string;
}

const SidebarItems = ({ onClose }: SidebarItemsProps) => {
  const [showTitles, setShowTitles] = useState(true);
  const [activePath, setActivePath] = useState<string>("");

  const finalItems: Item[] = items;

  const listItems = finalItems.map(({ icon, title, path }) => (
    <RouterLink
      key={title}
      to={path}
      onClick={() => {
        setActivePath(path);
        if (onClose) onClose();
      }}
    >
      <Flex
        gap={4}
        px={2}
        py={2}
        alignItems="center"
        fontSize="sm"
        background={activePath === path ? "gray.200" : "transparent"}
        _hover={{
          background: "gray.subtle",
        }}
      >
        <span title={title}>
          <Icon as={icon} alignSelf="center" boxSize="6" />
        </span>
        {showTitles && <Text ml={2}>{title}</Text>}
      </Flex>
    </RouterLink>
  ));

  return (
    <>
      <Flex
        paddingY="3"
        cursor="pointer"
        onClick={() => setShowTitles(!showTitles)}
      >
        <LuListCollapse size="20px" />
      </Flex>
      <Box>{listItems}</Box>
    </>
  );
};

export default SidebarItems;
