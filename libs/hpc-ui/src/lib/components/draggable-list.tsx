import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import React, { ReactNode, useState } from 'react';
import { Paper, Switch, Typography } from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import tw from 'twin.macro';
import { ButtonSubmit } from './button';

export interface DraggableListProps {
  title: string;
  queryValues: DraggableListItemProps[];
  buttonText: string;
  onClick: (elements: DraggableListItemProps[]) => any;
  sx?: React.CSSProperties;
  innerRef?: React.ForwardedRef<HTMLDivElement>;
  elevation?: number;
  children?: ReactNode;
}

type DraggableListItemProps = {
  id: number;
  displayLabel?: string;
  active?: boolean;
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
 p-2 my-1 flex justify-between items-center bg-white
 shadow-[rgba(50,_50,_105,_0.15)_0px_2px_5px_0px,_rgba(0,_0,_0,_0.05)_0px_1px_1px_0px]
`;
const TextContainer = tw.span`
inline-block`;

const DragIconContainer = tw.div`
flex items-center gap-x-4
`;

const SaveButtonWrapper = tw.div`
py-4 px-8 text-end sticky bg-white bottom-0 shadow-md shadow-black
`;
const DraggableListItem = ({
  item,
  index,
}: {
  item: DraggableListItemProps;
  index: number;
}) => {
  const [active, setActive] = useState(item.active);
  return (
    <Draggable
      draggableId={item.id.toString()}
      index={index}
      key={item.id}
      isDragDisabled={!active}
    >
      {(provided) => (
        <DraggableListItemContainer
          {...provided.dragHandleProps}
          {...provided.draggableProps}
          ref={provided.innerRef}
        >
          <DragIconContainer>
            <DragIndicatorIcon color={active ? 'primary' : 'disabled'} />
            <TextContainer>{item.displayLabel}</TextContainer>
          </DragIconContainer>
          <Switch
            color="primary"
            size="small"
            checked={active}
            onClick={() => {
              setActive(!active);
              item.active = !item.active;
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
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};
const DraggableList = ({
  title,
  queryValues,
  buttonText,
  onClick,
  sx,
  innerRef,
  elevation,
  children,
}: DraggableListProps) => {
  const [values, setValues] =
    React.useState<DraggableListItemProps[]>(queryValues);
  const onDragEnd = (result: any) => {
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
          onClick={() => onClick(values)}
          color="primary"
          text={buttonText}
        />
      </SaveButtonWrapper>
    </PaperContainer>
  );
};

DraggableList.defaultProps = {
  type: 'primary',
};
export default DraggableList;
