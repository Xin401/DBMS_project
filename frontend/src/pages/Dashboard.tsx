import React, { useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Grid,
  ButtonGroup,
  Divider,
  CircularProgress,
} from "@mui/material";
import { Bell } from "lucide-react";
import DashboardCalendar from "@/components/dashboard/DashboardCalendar";
import DashboardTodo from "@/components/dashboard/DashboardTodo";
import * as api from "../api/api";
import { useEvent } from "@/hook/useEvent";

type Props = {};

const Dashboard = (props: Props) => {
  const [view, setView] = React.useState("calendar"); // ["calendar", "todo"
  const [groupEvents, setGroupEvents] = React.useState([]);
  const [privateEvents, setPrivateEvents] = React.useState([]);
  const [todos, setTodos] = React.useState([]);

  const { loggedInId } = useEvent();

  return (
    <>
      {/* Header */}
      <AppBar
        component="div"
        color="transparent"
        position="static"
        elevation={0}
        sx={{ zIndex: 0, mb: 1 }}
      >
        <Toolbar disableGutters>
          <Grid container alignItems="center" spacing={2}>
            <Grid item>
              <Typography color="inherit" variant="h4" display={"inline"}>
                Dashboard
              </Typography>
            </Grid>
            <Grid item xs>
              {/* <Button
                size="small"
                color="inherit"
                variant="outlined"
                startIcon={<Bell size={15} />}
              >
                3 Warnings
              </Button> */}
            </Grid>
            <Grid item>
              <ButtonGroup
                size="small"
                color="inherit"
                aria-label="small button group"
              >
                <Button
                  sx={{
                    bgcolor: view === "calendar" ? "#d6d6d6" : "transparent",
                  }}
                  onClick={() => setView("calendar")}
                >
                  Calendar
                </Button>
                <Button
                  sx={{
                    bgcolor: view === "todo" ? "#d6d6d6" : "transparent",
                  }}
                  onClick={() => setView("todo")}
                >
                  Todo
                </Button>
              </ButtonGroup>
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
      <Divider sx={{ mb: 3 }} />

      {/* Calendar */}
      {view === "calendar" ? (
        <DashboardCalendar />
      ) : (
        <DashboardTodo />
      )}
    </>
  );
};

export default Dashboard;
