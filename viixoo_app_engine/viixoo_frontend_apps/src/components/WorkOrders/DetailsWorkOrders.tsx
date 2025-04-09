import {
  Button,
  ButtonGroup,
  DialogActionTrigger,
  VStack,
  Tabs,
  Table,
  Box,
  Input,
  Link,
} from "@chakra-ui/react"
import { useState } from "react"
import { GrView } from "react-icons/gr";

import type { WorkOrderPublic } from "../../client/types.gen"
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog"
import { Field } from "../ui/field"
import { useElapsedTime } from '../../hooks/elapsedTime';


interface WorkOrderProps {
  item: WorkOrderPublic
}

interface TimeEmployeePublicProps {
  date_start: string
}

export const TimeElapsed = ( { date_start }: TimeEmployeePublicProps) => {
  const elapsed = useElapsedTime(date_start);
  return <>{elapsed}</>;
};

export const DetailsWorkOrders = ({ item }: WorkOrderProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const formatDurationTime = (duration: number): string => {
    const minutes = Math.floor(duration);
    const seconds = Math.round((duration % 1) * 60);
    return `${minutes}:${seconds}`;
  };

  return (
    <DialogRoot
      size={{ base: "xs", md: "md" }}
      placement="center"
      open={isOpen}
      onOpenChange={({ open }) => setIsOpen(open)}
    >
      <DialogTrigger asChild>
        <Button size="xs" colorPalette="gray" variant="ghost">
          <GrView fontSize="16px" />
        </Button>
      </DialogTrigger>
      <DialogContent maxW="600px">
        <form>
          <DialogHeader>
            <DialogTitle>Orden de trabajo</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <VStack gap={4}>
              <Field
                label="Operación:"
              >
                <Input
                  id="name"
                  type="text"
                  defaultValue={item?.name || ""}
                  readOnly
                >
                </Input>
              </Field>
              <Field
                label="Centro de trabajo:"
              >
                <Input
                  id="workcenter"
                  type="text"
                  defaultValue={item?.workcenter || ""}
                  readOnly
                >
                </Input>
              </Field>

              <Field
                label="Producto:"
              >
                <Input
                  id="product"
                  type="text"
                  defaultValue={item?.product || ""}
                  readOnly
                >
                </Input>
              </Field>
              <Field
                label="Cantidad a producir:"
              >
                <Input
                  id="qty_remaining"
                  type="text"
                  defaultValue={item?.qty_remaining || ""}
                  readOnly
                >
                </Input>
              </Field>
              <Field
                label="Estado:"
              >
                <Input
                  id="duration_expected"
                  type="text"
                  defaultValue={item?.state || ""}
                  readOnly
                >
                </Input>
              </Field>
              <Tabs.Root defaultValue="tab-work-order-time" variant="subtle">
                <Tabs.List>
                    <Tabs.Trigger key="1" value="tab-work-order-time">
                    Seguimiento de tiempo
                    </Tabs.Trigger>
                    <Tabs.Trigger key="2" value="tab-instructions">
                    Instrucciones
                    </Tabs.Trigger>
                    <Tabs.Trigger key="3" value="tab-others">
                    Otra información
                    </Tabs.Trigger>
                    <Tabs.Trigger key="4" value="tab-block">
                    Bloqueos
                    </Tabs.Trigger>
                </Tabs.List>
               <Tabs.Content key="1" value="tab-work-order-time">
                  <Box maxH="130px" maxW="600px"overflowY="auto" borderWidth="1px" borderRadius="md">
                    <Table.Root maxH="100px" size="sm" showColumnBorder>
                      <Table.Header>
                        <Table.Row>
                          <Table.ColumnHeader fontWeight="bold" w="sm">Empleado</Table.ColumnHeader>
                          <Table.ColumnHeader fontWeight="bold" w="sm">Duración</Table.ColumnHeader>
                          <Table.ColumnHeader fontWeight="bold" w="sm">Inicio</Table.ColumnHeader>
                          <Table.ColumnHeader fontWeight="bold" w="sm">Fin</Table.ColumnHeader>
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        {item.time_ids?.map((time) => (
                          <Table.Row key={time.time_id}>
                            <Table.Cell truncate maxW="150px">
                              {time.employee}
                            </Table.Cell>
                            <Table.Cell truncate maxW="sm">
                              {(time.date_end)?formatDurationTime(time.duration): <TimeElapsed date_start={time.date_start}/>}
                            </Table.Cell>
                            <Table.Cell truncate maxW="30%">
                              {time.date_start}
                            </Table.Cell>
                            <Table.Cell truncate maxW="30%">
                              {time.date_end}
                            </Table.Cell>
                          </Table.Row>
                        ))}
                      </Table.Body>
                    </Table.Root>
                  </Box>
                </Tabs.Content>
                <Tabs.Content key="2" maxW="600px" value="tab-instructions">
                  <Field label="URL con las instrucciones:">
                    <Link
                      href={item?.url_document_instructions || ""}
                      target="_blank"
                      color="blue.500"
                      style={{
                        overflowWrap: "break-word",
                        wordBreak: "break-word",
                        display: "block",
                      }}
                    >
                      {item?.url_document_instructions || "No registrado"}
                    </Link>
                  </Field>

                  <Field style={{ marginTop: "15px" }} label="URL de los diseños en 3D de los planos:">
                    {item?.urls_plans && (
                      <div style={{ marginBottom: "8px" }}>
                        <Link
                          href={item?.urls_plans}
                          target="_blank"
                          color="blue.500"
                          style={{
                            overflowWrap: "break-word",
                            wordBreak: "break-word",
                            display: "block",
                          }}
                        >
                          {item?.urls_plans || "No registrado"}
                        </Link>
                      </div>
                    )}
                  </Field>
                </Tabs.Content>

                  <Tabs.Content key="3" value="tab-others">
              <Field
                label="Duración esperada:"
              >
                <Input
                  id="duration_expected"
                  type="text"
                  defaultValue={(item.duration_expected)?formatDurationTime(item.duration_expected):""}
                  readOnly
                >
                </Input>
              </Field>
              <Field
                label="Duración real:"
              >
                 <Input
                  id="duration"
                  type="text"
                  defaultValue={(item.duration)?formatDurationTime(item.duration):""}
                  readOnly
                >
                </Input>
              </Field>
                </Tabs.Content>
                <Tabs.Content key="1" value="tab-block">
                  <Box maxH="130px" maxW="600px"overflowY="auto" borderWidth="1px" borderRadius="md">
                    <Table.Root maxH="100px" size="sm" showColumnBorder>
                      <Table.Header>
                        <Table.Row>
                          <Table.ColumnHeader fontWeight="bold" w="sm">Fecha/Hora</Table.ColumnHeader>
                          <Table.ColumnHeader fontWeight="bold" w="sm">Motivo</Table.ColumnHeader>
                          <Table.ColumnHeader fontWeight="bold" w="sm">Descripción</Table.ColumnHeader>
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        {item.wororderblock_ids?.map((block) => (
                          <Table.Row key={block.block_id}>
                            <Table.Cell truncate maxW="150px">
                              {block.datetime}
                            </Table.Cell>
                            <Table.Cell truncate maxW="310px">
                              {block.loss}
                            </Table.Cell>
                            <Table.Cell truncate maxW="300px">
                              {block.description}
                            </Table.Cell>
                          </Table.Row>
                        ))}
                      </Table.Body>
                    </Table.Root>
                  </Box>
                </Tabs.Content>
              </Tabs.Root>
            </VStack>
          </DialogBody>

          <DialogFooter gap={2}>
            <ButtonGroup>
              <DialogActionTrigger asChild>
                <Button
                  variant="subtle"
                  colorPalette="gray"
                >
                  Cerrar
                </Button>
              </DialogActionTrigger>
            </ButtonGroup>
          </DialogFooter>
        </form>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  )
}
