import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { Paper, Switch, Typography } from '@mui/material';
import React, { type ReactNode, useState } from 'react';
import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
} from 'react-beautiful-dnd';
import tw from 'twin.macro';
import { ButtonSubmit } from './button';

export interface DraggableListProps {
  title: string;
  queryValues: DraggableListItemProps[];
  buttonText: string;
  onClick: (elements: DraggableListItemProps[]) => unknown;
  setOpenSettings?: React.Dispatch<React.SetStateAction<boolean>>;
  sx?: React.CSSProperties;
  innerRef?: React.ForwardedRef<HTMLDivElement>;
  elevation?: number;
  children?: ReactNode;
}

export type DraggableListItemProps = {
  id: number;
  label: string;
  isActive?: boolean;
};

const PaperContainer = tw(Paper)`
  pt-8
  relative
`;
const StyledDiv = tw.div`
  mt-12
  pb-4
  px-8
  flex
  flex-col
`;
const DraggableListItemContainer = tw.div`
  p-2
  my-1
  flex
  justify-between
  items-center
  bg-white
  shadow-[rgba(50,_50,_105,_0.15)_0px_2px_5px_0px,_rgba(0,_0,_0,_0.05)_0px_1px_1px_0px]
`;
const TextContainer = tw.span`
  inline-block
`;

const DragIconContainer = tw.div`
  flex
  items-center
  gap-x-4
`;

const SaveButtonWrapper = tw.div`
  py-4
  px-8
  text-end sticky
  bg-white bottom-0
  shadow-md
  shadow-black
`;
const DraggableListItem = ({
  item,
  index,
}: {
  item: DraggableListItemProps;
  index: number;
}) => {
  const [isActive, setIsActive] = useState(item.isActive);
  return (
    <Draggable
      draggableId={item.id.toString()}
      index={index}
      key={item.id}
      isDragDisabled={!isActive}
    >
      {(provided) => (
        <DraggableListItemContainer
          {...provided.dragHandleProps}
          {...provided.draggableProps}
          ref={provided.innerRef}
        >
          <DragIconContainer>
            <DragIndicatorIcon color={isActive ? 'primary' : 'disabled'} />
            <TextContainer>{item.label}</TextContainer>
          </DragIconContainer>
          <Switch
            color="primary"
            size="small"
            checked={isActive}
            onClick={() => {
              setIsActive(!isActive);
              item.isActive = !item.isActive;
            }}
          />
        </DraggableListItemContainer>
      )}
    </Draggable>
  );
};
const reorder = (
  list: DraggableListItemProps[],
  startIndex: number,
  endIndex: number
): DraggableListItemProps[] => {
  const result = [...list];
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};
const DraggableList = ({
  title,
  queryValues,
  buttonText,
  onClick,
  setOpenSettings,
  sx,
  innerRef,
  elevation,
  children,
}: DraggableListProps) => {
  const [values, setValues] =
    React.useState<DraggableListItemProps[]>(queryValues);
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const movedItems = reorder(
      values,
      result.source.index,
      result.destination.index
    );
    setValues(movedItems);
  };

  return (
    <PaperContainer ref={innerRef} sx={sx} elevation={elevation}>
      <DragDropContext onDragEnd={onDragEnd}>
        <Typography sx={tw`px-8`} variant="h5">
          {title}
        </Typography>
        {children}
        <Droppable droppableId={title.replace(' ', '').toLowerCase()}>
          {(provided) => (
            <StyledDiv {...provided.droppableProps} ref={provided.innerRef}>
              {values.map((value, index) => (
                <DraggableListItem item={value} index={index} key={value.id} />
              ))}
              {provided.placeholder}
            </StyledDiv>
          )}
        </Droppable>
      </DragDropContext>
      <SaveButtonWrapper>
        <ButtonSubmit
          onClick={() => {
            onClick(values);
            if (setOpenSettings) {
              setOpenSettings(false);
            }
          }}
          color="primary"
          text={buttonText}
        />
      </SaveButtonWrapper>
    </PaperContainer>
  );
};

export default DraggableList;
