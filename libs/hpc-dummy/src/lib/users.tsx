import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import {
  Dialog,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
} from '@material-ui/core';

import { styled, combineClasses, ThemeProvider } from '@unocha/hpc-ui';

import { User } from './data-types';

interface Listener {
  loginRequested?: () => void;
  usersUpdated?: (users: User[]) => void;
  loginAsUser?: (user: User) => void;
}

export class Users {
  private readonly listeners = new Set<Listener>();

  private users: User[] = [];

  public login = () => {
    for (const l of this.listeners) {
      if (l.loginRequested) l.loginRequested();
    }
  };

  public setUsers = (users: User[]) => {
    this.users = users;

    for (const l of this.listeners) {
      if (l.usersUpdated) l.usersUpdated(users);
    }
  };

  public getUsers = () => this.users;

  public addListener = (l: Listener) => {
    this.listeners.add(l);
  };

  public removeListener = (l: Listener) => {
    this.listeners.delete(l);
  };

  public loginAsUser(user: User) {
    for (const l of this.listeners) {
      if (l.loginAsUser) l.loginAsUser(user);
    }
  }

  public attach() {
    const container = document.createElement('div');
    document.body.appendChild(container);
    ReactDOM.render(
      <ThemeProvider>
        <UserPicker users={this} />
      </ThemeProvider>,
      container
    );
  }
}

interface Props {
  users: Users;
}

const UserPicker = (props: Props) => {
  const { users } = props;

  const [open, setOpen] = useState(false);
  const [usersList, setUsersList] = useState(users.getUsers());

  const listener: Listener = {
    loginRequested: () => setOpen(true),
    usersUpdated: (users) => setUsersList(users),
  };

  useEffect(() => {
    setUsersList(users.getUsers());
    users.addListener(listener);
    return () => users.removeListener(listener);
  }, []);

  return (
    <Dialog open={open} onClose={() => setOpen(false)}>
      <DialogTitle>Select a user</DialogTitle>
      <List>
        {usersList.map((user) => (
          <ListItem
            button
            onClick={() => users.loginAsUser(user)}
            key={user.id}
          >
            <ListItemText primary={user.user.name} />
          </ListItem>
        ))}
      </List>
    </Dialog>
  );
};
