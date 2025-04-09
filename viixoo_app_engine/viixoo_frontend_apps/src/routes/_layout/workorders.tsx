import {
  Container,
  EmptyState,
  Flex,
  Heading,
  Table,
  VStack,
  Button,
  Group,
  Input,
} from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FiSearch } from "react-icons/fi";
import { z } from "zod";

import useCustomToast from "@/hooks/useCustomToast";
import { handleError } from "@/utils";

import {
  type ApiError,
  type ChangeStateWorkOrder,
  WorkOrdersService,
} from "@/client";
import PendingWorkOrders from "@/components/Pending/PendingWorkOrders";
import { DetailsWorkOrders } from "../../components/WorkOrders/DetailsWorkOrders";
import { BlockWorkOrders } from "../../components/WorkOrders/BlockWorkOrders";
import { AddComponentsWorkOrders } from "../../components/WorkOrders/AddComponentsWorkOrders";
import { ConsumeComponentsWorkOrders } from "../../components/WorkOrders/ConsumeComponentsWorkOrders";
import { MenuContent, MenuRoot, MenuTrigger } from "../../components/ui/menu";
import { IconButton } from "@chakra-ui/react";
import { BsThreeDotsVertical } from "react-icons/bs";
import {
  PaginationItems,
  PaginationNextTrigger,
  PaginationPrevTrigger,
  PaginationRoot,
} from "@/components/ui/pagination.tsx";
import { useElapsedTime } from "../../hooks/elapsedTime";
import type { WorkOrderPublic } from "../../client/types.gen";
import { useState } from "react";

const itemsSearchSchema = z.object({
  page: z.number().catch(1),
});

const PER_PAGE = 10;

function getWorkOrdersQueryOptions({
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
      WorkOrdersService.readWorkOrders({
        skip: (page - 1) * PER_PAGE,
        limit: PER_PAGE,
        order_search: order_search,
        show_all_state: show_all_state,
      }),
    queryKey: ["workorders", { page, order_search, show_all_state }],
  };
}

export const Route = createFileRoute("/_layout/workorders")({
  component: WorkOrders,
  validateSearch: (search) => itemsSearchSchema.parse(search),
});

interface WorkOrderProps {
  item: WorkOrderPublic;
}

export const formatDuration = (duration: number): string => {
  if (duration == 0) return "00:00";

  const minutes = Math.floor(duration);
  const seconds = Math.round((duration % 1) * 60);
  return `${minutes}:${seconds}`;
};

export const TimeElapsedWorkOrder = ({ item }: WorkOrderProps) => {
  const activeTime = item.time_ids?.find((time) => !time.date_end);

  const date_start = activeTime?.date_start;

  const baseElapsed = useElapsedTime(date_start || "");

  const addFixedTime = (timeString: string) => {
    if (!timeString) return "00:00";

    const [minutes, seconds] = timeString.split(":").map(Number);
    const totalSeconds = minutes * 60 + seconds;

    const durationMinutes = Math.floor(item.duration);
    const durationSeconds = Math.round((item.duration % 1) * 60);

    if (!timeString) return "00:00";

    const itemTotalSeconds = durationMinutes * 60 + durationSeconds;

    const newTotalSeconds = totalSeconds + itemTotalSeconds;

    const newMinutes = Math.floor(newTotalSeconds / 60);
    const newSeconds = newTotalSeconds % 60;

    return `${String(newMinutes).padStart(2, "0")}:${String(
      newSeconds
    ).padStart(2, "0")}`;
  };

  if (!date_start) return <>00:00</>;

  return <>{addFixedTime(baseElapsed)}</>;
};

function WorkOrdensTable({
  searchQuery,
  showAllStates,
}: {
  searchQuery: string;
  showAllStates: boolean;
}) {
  const navigate = useNavigate({ from: Route.fullPath });
  const { page } = Route.useSearch();

  const { data, isLoading, isPlaceholderData } = useQuery(
    getWorkOrdersQueryOptions({
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
  const queryClient = useQueryClient();
  const { showSuccessToast } = useCustomToast();
  const mutationStartWorkorder = useMutation({
    mutationFn: (data: ChangeStateWorkOrder) =>
      WorkOrdersService.startWorkorder({ requestBody: data }),
    onSuccess: () => {
      showSuccessToast("Orden iniciada satisfactoriamente.");
      queryClient.invalidateQueries({
        queryKey: ["workorders", { page, order_search: searchQuery, show_all_state:showAllStates }],
      });
    },
    onError: (err: ApiError) => {
      handleError(err);
    },
  });

  const onClickStartWorkorder = async (data: ChangeStateWorkOrder) => {
    mutationStartWorkorder.mutate(data);
  };

  const mutationPauseWorkorder = useMutation({
    mutationFn: (data: ChangeStateWorkOrder) =>
      WorkOrdersService.pauseWorkorder({ requestBody: data }),
    onSuccess: () => {
      showSuccessToast("Orden pausada satisfactoriamente.");
      queryClient.invalidateQueries({
        queryKey: ["workorders", { page, order_search: searchQuery, show_all_state:showAllStates }],
      });
    },
    onError: (err: ApiError) => {
      handleError(err);
    },
  });

  const onClickPauseWorkorder = async (data: ChangeStateWorkOrder) => {
    mutationPauseWorkorder.mutate(data);
  };

  const mutationFinishWorkorder = useMutation({
    mutationFn: (data: ChangeStateWorkOrder) =>
      WorkOrdersService.finishWorkorder({ requestBody: data }),
    onSuccess: () => {
      showSuccessToast("Orden finalizada satisfactoriamente.");
      queryClient.invalidateQueries({
        queryKey: ["workorders", { page, order_search: searchQuery, show_all_state:showAllStates }],
      });
    },
    onError: (err: ApiError) => {
      handleError(err);
    },
  });

  const onClickFinishWorkorder = async (data: ChangeStateWorkOrder) => {
    mutationFinishWorkorder.mutate(data);
  };

  const mutationUnblockWorkorder = useMutation({
    mutationFn: (data: ChangeStateWorkOrder) =>
      WorkOrdersService.unblockWorkorder({ requestBody: data }),
    onSuccess: () => {
      showSuccessToast("Orden desbloqueada satisfactoriamente.");
      queryClient.invalidateQueries({
        queryKey: ["workorders", { page, order_search: searchQuery, show_all_state:showAllStates }],
      });
    },
    onError: (err: ApiError) => {
      handleError(err);
    },
  });

  const onClickUnblockWorkorder = async (data: ChangeStateWorkOrder) => {
    mutationUnblockWorkorder.mutate(data);
  };

  if (isLoading) {
    return <PendingWorkOrders />;
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
              Usted no tiene órdenes de trabajo asignadas
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
              Operación
            </Table.ColumnHeader>
            <Table.ColumnHeader w="sm" fontWeight="bold">
              Producto
            </Table.ColumnHeader>
            <Table.ColumnHeader w="sm" fontWeight="bold">
              Cantidad a producir
            </Table.ColumnHeader>
            <Table.ColumnHeader w="sm" fontWeight="bold">
              Duración real
            </Table.ColumnHeader>
            <Table.ColumnHeader w="sm" fontWeight="bold">
              Estado
            </Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {items?.map((item) => (
            <Table.Row
              key={item.workorder_id}
              opacity={isPlaceholderData ? 0.5 : 1}
            >
              <Table.Cell truncate maxW="sm">
                {item.name}
              </Table.Cell>
              <Table.Cell truncate maxW="sm">
                {item.product}
              </Table.Cell>
              <Table.Cell truncate maxW="30%">
                {item.qty_remaining}
              </Table.Cell>
              <Table.Cell truncate maxW="30%">
                {item.is_user_working ? (
                  <TimeElapsedWorkOrder item={item} />
                ) : (
                  formatDuration(item.duration)
                )}
              </Table.Cell>
              <Table.Cell truncate maxW="30%">
                {item.state}
              </Table.Cell>
              <Table.Cell>
                <DetailsWorkOrders item={item} />
              </Table.Cell>
              <Table.Cell>
                <Group display={item.readonly? "none": "flex"}>
                  <Button
                    minW="60px"
                    size="xs"
                    onClick={() =>
                      onClickStartWorkorder({ workorder_id: item.workorder_id })
                    }
                    colorPalette="green"
                    display={[
                      "done",
                      "cancel",
                    ].includes(item.state_value) ||
                    ["draft", "done", "cancel"].includes(item.production_state) ||
                    item.working_state == "blocked" ||
                    item.is_user_working ||
                    ["operator", "warehouse"].includes(item.access_type)
                      ? "none"
                      : "flex"
                  }
                  >
                    Iniciar
                  </Button>
                  <Button
                    minW="60px"
                    size="xs"
                    onClick={() =>{
                        if (item.quality_state == "none") {
                          const { showErrorToast } = useCustomToast();
                          showErrorToast("Primero debe completar los controles de calidad.");
                        } else {
                          onClickFinishWorkorder({ workorder_id: item.workorder_id })
                        }
                      }
                    }
                    colorPalette="green"
                    display={[
                      "draft",
                      "done",
                    ].includes(item.production_state) ||
                    item.working_state == "blocked" ||
                    !item.is_user_working ||
                    (item.quality_state != "" && item.quality_state != "none") ||
                    [
                      "register_consumed_materials",
                      "register_byproducts",
                      "instructions",
                    ].includes(item.test_type) ||
                    ["operator", "warehouse"].includes(item.access_type)
                      ? "none"
                      : "flex"
                  }
                  >
                    Listo
                  </Button>
                </Group>
              </Table.Cell>
              <Table.Cell>
                <MenuRoot>
                  <MenuTrigger asChild>
                    <IconButton variant="ghost" color="inherit" display={item.readonly || (item.working_state == "blocked" && item.access_type == "operator")? "none": "flex"}>
                      <BsThreeDotsVertical />
                    </IconButton>
                  </MenuTrigger>
                  <MenuContent minWidth="200px" width="full">
                    <ConsumeComponentsWorkOrders item={item} />
                    <AddComponentsWorkOrders item={item} />
                    <Button
                      my={2}
                      maxH="35px"
                      width="100%"
                      variant="subtle"
                      size="md"
                      onClick={() =>
                        onClickPauseWorkorder({ workorder_id: item.workorder_id })
                      }
                      colorPalette="gray"
                      display={[
                        "draft",
                        "done",
                        "cancel",
                      ].includes(item.production_state) ||
                      item.working_state == "blocked" ||
                      !item.is_user_working ||
                      item.access_type != "supervisor"
                        ? "none"
                        : "flex"
                    }
                  >
                      Pausar
                    </Button>

                    <BlockWorkOrders item={item} />

                    <Button
                      my={2}
                      maxH="35px"
                      width="100%"
                      variant="solid"
                      size="md"
                      onClick={() =>
                        onClickUnblockWorkorder({ workorder_id: item.workorder_id })
                      }
                      colorPalette="red"
                      display={[
                        "draft",
                        "done",
                        "cancel",
                      ].includes(item.production_state) ||
                      item.working_state != "blocked" ||
                      item.access_type != "supervisor"
                        ? "none"
                        : "flex"
                    }
                  >
                      Desbloquear
                    </Button>
                  </MenuContent>
                </MenuRoot>
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

function WorkOrders() {
  const [searchQuery, setSearchQuery] = useState("");
  const [triggerSearch, setTriggerSearch] = useState("");
  const [showAllStates, setShowAllStates] = useState(false);

  const handleSearchClick = () => {
    setTriggerSearch(searchQuery);
  };

  const handleShowAllStatesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShowAllStates(e.target.checked);
  };

  return (
    <Container maxW="full">
      <Heading size="lg" pt={12}>
        Órdenes de trabajo
      </Heading>
      <Flex mb={4} alignItems="center" justifyContent="space-between">
        <Flex alignItems="center">
          <Input
            placeholder="Buscar por operación..."
            value={searchQuery}
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
          <label htmlFor="showAllStates" style={{ marginRight: "8px" }}>
            Mostrar todos los estados
          </label>
          <input
            id="showAllStates"
            type="checkbox"
            checked={showAllStates}
            onChange={handleShowAllStatesChange}
          />
        </Flex>
      </Flex>

      <WorkOrdensTable
        searchQuery={triggerSearch}
        showAllStates={showAllStates}
      />
    </Container>
  );
}
