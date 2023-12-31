import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { Plus, Pencil, Trash, Save, X } from "lucide-react";
import * as api from "../../api/api";
import {
  GridRowsProp,
  GridRowModesModel,
  GridRowModes,
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridActionsCellItem,
  GridEventListener,
  GridRowId,
  GridRowModel,
  GridRowEditStopReasons,
  gridClasses,
} from "@mui/x-data-grid";
import { useParams } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { v4 as uuidv4 } from "uuid";
import { Todo, User } from "@/typing/typing.d";
import { Alert, Snackbar } from "@mui/material";

// const members = ["John", "Anson", "Xin"];

const initialRows: GridRowsProp = [
  {
    id: 1,
    completed: false,
    todo: "Todo 1",
    description:
      "Nullam cursus tincidunt auctor. Nullam cursus tincidunt auctor. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    assigner: "Assigner 1",
    assignee: "Assignee 1",
    deadline: new Date("2023-12-30"),
  },
  {
    id: 2,
    completed: true,
    todo: "Todo 2",
    description: "Description 2",
    assigner: "Assigner 2",
    assignee: "Assignee 2",
    deadline: new Date(),
  },
  {
    id: 3,
    completed: false,
    todo: "Todo 3",
    description: "Description 3",
    assigner: "Assigner 3",
    assignee: "Assignee 3",
    deadline: new Date("2023-12-30"),
  },
];

interface EditToolbarProps {
  setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
  setRowModesModel: (
    newModel: (oldModel: GridRowModesModel) => GridRowModesModel
  ) => void;
}

function EditToolbar(props: EditToolbarProps) {
  const { setRows, setRowModesModel } = props;

  const handleClick = () => {
    // id 隨機產生
    const id = "new";
    setRows((oldRows) => [
      ...oldRows,
      {
        id,
        assignee: "",
        assigner: "",
        completed: false,
        deadline: "",
        description: "",
        todo: "",
        isNew: true,
      },
    ]);
    setRowModesModel((oldModel) => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: "name" },
    }));
  };

  return (
    <GridToolbarContainer>
      <Button color="primary" startIcon={<Plus />} onClick={handleClick}>
        Add Todo
      </Button>
    </GridToolbarContainer>
  );
}

const GroupTodo = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});

  const [todos, setTodos] = useState<any>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [fetchedManager, setFetchedMaanager] = useState(false);
  const [fetchedTodos, setFetchedTodos] = useState(false);
  const { groupId } = useParams();
  const { user } = useUser();

  const [warnMsg, setWarnMsg] = useState("");
  const [snackBarOpen, setSnackBarOpen] = useState(false);

  useEffect(() => {
    if (warnMsg !== "") setSnackBarOpen(true);
  }, [warnMsg]);

  // groupTodos
  const fetchGroupTodos = async () => {
    setFetchedTodos(true);
    var groupTodos: any;
    try {
      var userId: string = "";
      if (user) userId = user.id;
      groupTodos = await api.getUserTodos(userId);
      console.log("todoData", groupTodos.data);
      setRows([]);
      groupTodos.data.map((todo: any) => {
        if (todo.groupId === groupId) {
          let todoIsNew = {
            id: todo.todoId,
            assignee: todo.assigneeName,
            assigner: todo.assignerName,
            completed: todo.completed,
            deadline: new Date(todo.deadline),
            description: todo.description,
            todo: todo.name,
            isNew: false,
          };
          setRows((rows: any) => [...rows, todoIsNew]);
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

  const fetchGroupManagers = async () => {
    setFetchedMaanager(true);
    var groupManagers: any;
    try {
      if (!groupId) return;
      groupManagers = await api.getGroupManagerWithId(groupId);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchGroupUsers = async () => {
    var groupUsers: any;
    try {
      if (!groupId) return;
      groupUsers = await api.getGroupUsers(groupId);
      setMembers(groupUsers.data);
      console.log(groupUsers.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchGroupManagers();
    fetchGroupTodos();
    fetchGroupUsers();
    console.log(members);
  }, [groupId]);

  useEffect(() => {
    console.log("rows changed", rows);
  }, [rows]);

  const assignTodo = async (
    assigneeId: string,
    name: string,
    description: string,
    deadline: Date
  ) => {
    if (!user || !groupId) return;
    try {
      console.log("assgining");
      const response = await api.assignTodo({
        todoId: uuidv4(),
        groupId: groupId,
        assigneeId: assigneeId,
        assignerId: user.id,
        name: name,
        description: description,
        completed: false,
        deadline: deadline,
      });
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  };

  const handleRowEditStop: GridEventListener<"rowEditStop"> = (
    params,
    event
  ) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const handleEditClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id: GridRowId) => () => {
    // console.log("handle save", rows)
    // const newRow = rows.find((row)=> row.id === id)
    // if (!newRow.deadline || !newRow.todo || !newRow.description){
    //   setWarnMsg("Please fill in everything")
    //   return
    // }
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
    // rows.map((row)=>{
    //   if(row.id === id)
    //     console.log(row)
    // })
  };

  const handleDeleteClick = async (id: GridRowId) => {
    const editedRow = rows.find((row) => row.id === id);
    console.log(editedRow, id);
    if (editedRow.assigner !== user?.fullName) {
      setWarnMsg("You are not assigner");
    }
    console.log("deleted");
    const res = await api.deleteTodo(editedRow.id);
    console.log(res);
    setRows(rows.filter((row) => row.id !== id));
  };

  const handleCancelClick = (id: GridRowId) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });

    const editedRow = rows.find((row) => row.todoId === id);
    if (editedRow!.isNew) {
      setRows(rows.filter((row) => row.todoId !== id));
    }
  };

  const processRowUpdate = (newRow: GridRowModel) => {
    console.log("processRowUpdate", newRow);
    const updatedRow: GridRowModel = {
      ...newRow,
      isNew: false,
      assigner: user?.fullName,
    };
    console.log(updatedRow);

    if (!updatedRow.deadline || !updatedRow.todo || !updatedRow.description) {
      setWarnMsg("Please fill in everything");
      return;
    }
    setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));

    var id: string | undefined;
    members.map((member) => {
      if (member.name == newRow.assignee) {
        console.log(member.name, member.userId);
        id = member.userId;
      }
    });
    if (!user || !id || newRow.id !== "new") {
      var assigneeId: string | undefined;
      var assignerId: string | undefined;
      members.map((member) => {
        if (member.name === newRow.assigner) {
          console.log(member.name, member.userId);
          assignerId = member.userId;
        }
        if (member.name === newRow.assignee) {
          assigneeId = member.userId;
        }
      });
      if (!groupId || !assigneeId || !assignerId) return;
      const reqBdy: Todo = {
        todoId: newRow.id,
        groupId: groupId,
        assigneeId,
        assignerId,
        name: newRow.todo,
        description: newRow.description,
        completed: newRow.completed,
        deadline: newRow.deadline.toISOString(),
      };
      console.log(reqBdy)
      api.updateTodo(reqBdy);
      console.log(updatedRow);
      return updatedRow;
    }
    newRow.id = uuidv4();
    assignTodo(id, newRow.todo, newRow.description, newRow.deadline);
    return updatedRow;
  };

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const columns: GridColDef[] = [
    {
      field: "completed",
      headerName: "Finished",
      type: "boolean",
      width: 100,
      editable: true,
    },
    {
      field: "todo",
      headerName: "Todo",
      width: 260,
      editable: true,
    },
    {
      field: "description",
      headerName: "Description",
      width: 260,
      editable: true,
    },
    {
      field: "assigner",
      headerName: "Assigner",
      width: 130,
    },
    {
      field: "assignee",
      headerName: "Assignee",
      width: 130,
      editable: true,
      type: "singleSelect",
      valueOptions: members.map((member) => member.name),
    },
    {
      field: "deadline",
      headerName: "Deadline",
      width: 140,
      type: "date",
      editable: true,
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 100,
      cellClassName: "actions",
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              icon={<Save />}
              label="Save"
              sx={{
                color: "primary.main",
              }}
              onClick={handleSaveClick(id)}
            />,
            <GridActionsCellItem
              icon={<X />}
              label="Cancel"
              className="textPrimary"
              onClick={handleCancelClick(id)}
              color="inherit"
            />,
          ];
        }

        return [
          <GridActionsCellItem
            icon={<Pencil />}
            label="Edit"
            className="textPrimary"
            onClick={handleEditClick(id)}
            color="inherit"
          />,
          <GridActionsCellItem
            icon={<Trash />}
            label="Delete"
            onClick={() => handleDeleteClick(id)}
            color="inherit"
          />,
        ];
      },
    },
  ];

  return (
    <>
      <Box
        sx={{
          width: "100%",
          "& .actions": {
            color: "text.secondary",
          },
          "& .textPrimary": {
            color: "text.primary",
          },
        }}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          getRowHeight={() => "auto"}
          sx={{
            [`& .${gridClasses.cell}`]: {
              py: 1,
            },
          }}
          disableRowSelectionOnClick
          initialState={{
            sorting: {
              sortModel: [{ field: "completed", sort: "asc" }],
            },
          }}
          editMode="row"
          rowModesModel={rowModesModel}
          onRowModesModelChange={handleRowModesModelChange}
          onRowEditStop={handleRowEditStop}
          processRowUpdate={processRowUpdate}
          slots={{
            toolbar: EditToolbar,
          }}
          slotProps={{
            toolbar: { setRows, setRowModesModel },
          }}
        />
      </Box>
      <Snackbar
        open={snackBarOpen}
        autoHideDuration={6000}
        onClose={() => {
          setSnackBarOpen(false);
        }}
      >
        <Alert severity="error">{warnMsg}</Alert>
      </Snackbar>
    </>
  );
};

export default GroupTodo;
