import {
  Container,
  EmptyState,
  Flex,
  Heading,
  Table,
  VStack,
  Input,
  Button,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FiSearch } from "react-icons/fi";
import { z } from "zod";
import { DetailsProductionOrder } from "../../components/ProductionOrders/DetailsProductionOrders";
import { ItemsService } from "@/client";
import PendingItems from "@/components/Pending/PendingItems";

import {
  PaginationItems,
  PaginationNextTrigger,
  PaginationPrevTrigger,
  PaginationRoot,
} from "@/components/ui/pagination.tsx";
import { useState } from "react";

const itemsSearchSchema = z.object({
  page: z.number().catch(1),
});

const PER_PAGE = 10;

function getItemsQueryOptions({
  page,
  order_search,
  show_all_state,
}: {
  page: number;
  order_search: string;
  show_all_state: boolean;
}) {
  return {
    queryFn: () =>
      ItemsService.readItems({
        skip: (page - 1) * PER_PAGE,
        limit: PER_PAGE,
        order_search: order_search,
        show_all_state: show_all_state,
      }),
    queryKey: ["productionorders", { page, order_search, show_all_state }],
  };
}

export const Route = createFileRoute("/_layout/items")({
  component: Items,
  validateSearch: (search) => itemsSearchSchema.parse(search),
});

function ProductionOrdensTable({
  searchQuery,
  showAllStates,
}: {
  searchQuery: string;
  showAllStates: boolean;
}) {
  const navigate = useNavigate({ from: Route.fullPath });
  const { page } = Route.useSearch();

  const { data, isLoading, isPlaceholderData } = useQuery(
    getItemsQueryOptions({
      page,
      order_search: searchQuery,
      show_all_state: showAllStates,
    })
  );

  const setPage = (page: number) =>
    navigate({
      search: (prev: { [key: string]: string }) => ({ ...prev, page }),
    });

  const items = data?.data.slice(0, PER_PAGE) ?? [];
  const count = data?.count ?? 0;

  if (isLoading) {
    return <PendingItems />;
  }

  if (items.length === 0) {
    return (
      <EmptyState.Root>
        <EmptyState.Content>
          <EmptyState.Indicator>
            <FiSearch />
          </EmptyState.Indicator>
          <VStack textAlign="center">
            <EmptyState.Title>
              Usted no tiene órdenes de fabricación asignadas
            </EmptyState.Title>
          </VStack>
        </EmptyState.Content>
      </EmptyState.Root>
    );
  }

  return (
    <>
      <Table.Root size={{ base: "sm", md: "md" }}>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader w="sm" fontWeight="bold">
              Referencia
            </Table.ColumnHeader>
            <Table.ColumnHeader w="sm" fontWeight="bold">
              Inicio
            </Table.ColumnHeader>
            <Table.ColumnHeader w="sm" fontWeight="bold">
              Producto
            </Table.ColumnHeader>
            <Table.ColumnHeader w="sm" fontWeight="bold">
              Cantidad
            </Table.ColumnHeader>
            <Table.ColumnHeader w="sm" fontWeight="bold">
              Estado
            </Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {items?.map((item) => (
            <Table.Row key={item.production_id} opacity={isPlaceholderData ? 0.5 : 1}>
              <Table.Cell truncate maxW="sm">
                {item.name}
              </Table.Cell>
              <Table.Cell truncate maxW="sm">
                {item.date_start}
              </Table.Cell>
              <Table.Cell truncate maxW="sm">
                {item.product}
              </Table.Cell>
              <Table.Cell truncate maxW="30%">
                {item.product_qty}
              </Table.Cell>
              <Table.Cell truncate maxW="30%">
                {item.state}
              </Table.Cell>
              <Table.Cell>
                <DetailsProductionOrder item={item} />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
      <Flex justifyContent="flex-end" mt={4}>
        <PaginationRoot
          count={count}
          pageSize={PER_PAGE}
          onPageChange={({ page }) => setPage(page)}
        >
          <Flex>
            <PaginationPrevTrigger />
            <PaginationItems />
            <PaginationNextTrigger />
          </Flex>
        </PaginationRoot>
      </Flex>
    </>
  );
}

function Items() {
  const [searchQuerypo, setSearchQuery] = useState("");
  const [triggerSearchpo, setTriggerSearch] = useState("");
  const [showAllStatespo, setShowAllStates] = useState(false);

  const handleSearchClick = () => {
    setTriggerSearch(searchQuerypo);
  };

  const handleShowAllStatesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShowAllStates(e.target.checked);
  };

  return (
    <Container maxW="full">
      <Heading size="lg" pt={12}>
        Órdenes de fabricación
      </Heading>
      <Flex mb={4} alignItems="center" justifyContent="space-between">
        <Flex alignItems="center">
          <Input
            placeholder="Buscar por referencia..."
            value={searchQuerypo}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="md"
            width="300px"
          />
          <Button
            size="md"
            colorPalette="gray"
            variant="ghost"
            onClick={handleSearchClick}
          >
            <FiSearch fontSize="16px" />
          </Button>
        </Flex>

        <Flex alignItems="center">
          <label htmlFor="showAllStatespo" style={{ marginRight: "8px" }}>
            Mostrar todos los estados
          </label>
          <input
            id="showAllStatespo"
            type="checkbox"
            checked={showAllStatespo}
            onChange={handleShowAllStatesChange}
          />
        </Flex>
      </Flex>
      <ProductionOrdensTable
        searchQuery={triggerSearchpo}
        showAllStates={showAllStatespo}
      />
    </Container>
  );
}
