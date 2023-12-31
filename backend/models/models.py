# models.py

from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, Text, DateTime, CheckConstraint
from sqlalchemy.orm import relationship
from database import Base

class UserTable(Base):
    __tablename__ = 'user_table'
    userid = Column(String(50), primary_key=True)
    name = Column(String(40), nullable=False)
    account = Column(String(40), nullable=False)
    password = Column(String(10), nullable=False)
    profile_pic_url = Column(Text, nullable=True)

class IsAdmin(Base):
    __tablename__ = 'isadmin'
    userid = Column(String(50), ForeignKey('user_table.userid'), primary_key=True)

class PrivateEvent(Base):
    __tablename__ = 'private_event'
    eventid = Column(String(50), primary_key=True)
    userid = Column(String(50), ForeignKey('user_table.userid'), nullable=False)
    event_start = Column(DateTime, nullable=False)
    event_end = Column(DateTime, nullable=False)
    name = Column(String(10), nullable=False)
    description = Column(Text, nullable=True)

class GroupTable(Base):
    __tablename__ = 'group_table'
    groupid = Column(String(50), primary_key=True)
    name = Column(String(20), nullable=False)

class GroupHasUser(Base):
    __tablename__ = 'group_has_user'
    groupid = Column(String(50), ForeignKey('group_table.groupid'), primary_key=True)
    userid = Column(String(50), ForeignKey('user_table.userid'), primary_key=True)

class GroupHasManager(Base):
    __tablename__ = 'group_has_manager'
    groupid = Column(String(50), ForeignKey('group_table.groupid'), primary_key=True)
    userid = Column(String(50), ForeignKey('user_table.userid'), primary_key=True)

class GroupEvent(Base):
    __tablename__ = 'group_event'
    eventid = Column(String(50), primary_key=True)
    groupid = Column(String(20), ForeignKey('group_table.groupid'), nullable=False)
    name = Column(String(20), nullable=False)
    description = Column(Text, nullable=False)
    event_start = Column(DateTime)
    event_end = Column(DateTime)
    status = Column(String(13), nullable=False)
    organizerid = Column(String(50), ForeignKey('user_table.userid'), nullable=False)
    vote_start = Column(DateTime, nullable=True)
    vote_end = Column(DateTime, nullable=True)
    votedeadline = Column(DateTime, nullable=True)
    havepossibility = Column(Boolean, nullable=True)

    @property
    def status(self):
        return self._status

    @status.setter
    def status(self, value):
        self._status = value
    
    # __table_args__ = (CheckConstraint("status IN ('In_Voting', 'End_Voting', 'Not_Start_Yet', 'On_Going', 'Closure')", name='check_status'))

class UserJoinEvent(Base):
    __tablename__ = 'user_join_event'
    userid = Column(String(50), ForeignKey('user_table.userid'), primary_key=True)
    eventid = Column(String(50), ForeignKey('group_event.eventid'), primary_key=True)
    isaccepted = Column(Boolean)

class AvailableTime(Base):
    __tablename__ = 'available_time'
    userid = Column(String(50), ForeignKey('user_table.userid'), primary_key=True)
    eventid = Column(String(50), ForeignKey('group_event.eventid'), primary_key=True)
    available_start = Column(DateTime, primary_key=True)
    possibility_level = Column(String(10), nullable=False)
    # __table_args__ = (CheckConstraint("possibility_level IN ('Definitely', 'Maybe')", name='check_possibility'))

class Todo(Base):
    __tablename__ = 'todo'
    todoid = Column(String(50), primary_key=True)
    groupid = Column(String(50), ForeignKey('group_table.groupid'), nullable=False)
    assigneeid = Column(String(50), ForeignKey('user_table.userid'), nullable=False)
    assignerid = Column(String(50), ForeignKey('user_table.userid'), nullable=False)
    name = Column(String(20), nullable=False)
    description = Column(Text, nullable=False)
    completed = Column(Boolean, nullable=False)
    deadline = Column(DateTime, nullable=False)

class Chat(Base):
    __tablename__ = 'chat'
    groupid = Column(String(50), ForeignKey('group_table.groupid'), primary_key=True)
    speakerid = Column(String(50), ForeignKey('user_table.userid'), primary_key=True)
    timing = Column(DateTime, primary_key=True)
    content = Column(Text, nullable=False)
