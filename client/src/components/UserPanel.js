import React from 'react';
import styled from 'styled-components';
import { Users, Circle, User, Activity } from 'lucide-react';

const UserPanelContainer = styled.div`
  width: 200px;
  background-color: #252526;
  border-left: 1px solid #3e3e42;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const UserPanelHeader = styled.div`
  padding: 15px;
  border-bottom: 1px solid #3e3e42;
  background-color: #2d2d30;
`;

const UserPanelTitle = styled.h3`
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #cccccc;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const UserList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 10px 0;
`;

const UserItem = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 15px;
  border-bottom: 1px solid #2d2d30;
  
  &:hover {
    background-color: #2a2d2e;
  }
`;

const UserAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-weight: 600;
  font-size: 14px;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
`;

const UserInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const UserName = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: #ffffff;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UserStatus = styled.div`
  font-size: 11px;
  color: #888;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const StatusIndicator = styled.div`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: ${props => props.status === 'online' ? '#4caf50' : '#f44336'};
`;

const OnlineIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #4caf50;
  padding: 8px 15px;
  background-color: rgba(76, 175, 80, 0.1);
  border-bottom: 1px solid #2d2d30;
`;

const NoUsersMessage = styled.div`
  padding: 20px 15px;
  text-align: center;
  color: #888;
  font-size: 13px;
`;

const UserActivity = styled.div`
  font-size: 11px;
  color: #666;
  margin-top: 2px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const getInitials = (name) => {
  return name
    .split('_')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const UserPanel = ({ users }) => {
  const onlineUsers = users.filter(user => user.id);
  const totalUsers = onlineUsers.length;

  return (
    <UserPanelContainer>
      <UserPanelHeader>
        <UserPanelTitle>
          <Users size={16} />
          COLLABORATORS
        </UserPanelTitle>
      </UserPanelHeader>
      
      <OnlineIndicator>
        <Circle size={8} fill="#4caf50" />
        {totalUsers} user{totalUsers !== 1 ? 's' : ''} online
      </OnlineIndicator>
      
      <UserList>
        {onlineUsers.length > 0 ? (
          onlineUsers.map((user) => (
            <UserItem key={user.id}>
              <UserAvatar color={user.color}>
                {getInitials(user.name)}
              </UserAvatar>
              
              <UserInfo>
                <UserName>{user.name}</UserName>
                <UserStatus>
                  <StatusIndicator status="online" />
                  Online
                </UserStatus>
                
                {user.currentFile && (
                  <UserActivity>
                    <Activity size={10} />
                    Editing {user.currentFile}
                  </UserActivity>
                )}
              </UserInfo>
            </UserItem>
          ))
        ) : (
          <NoUsersMessage>
            <User size={24} />
            <div style={{ marginTop: '8px' }}>
              No users online
            </div>
            <div style={{ fontSize: '11px', marginTop: '4px' }}>
              Invite others to join!
            </div>
          </NoUsersMessage>
        )}
      </UserList>
    </UserPanelContainer>
  );
};

export default UserPanel;
