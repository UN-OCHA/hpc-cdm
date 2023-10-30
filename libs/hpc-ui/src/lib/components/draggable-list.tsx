import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import React, { useState } from 'react';
import { Paper, Switch, Typography } from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import tw from 'twin.macro';
import { ButtonSubmit } from './button';

export interface DraggableListProps {
  title: string;
  possibleValues: string[];
  activeValues: string[];
  sx?: React.CSSProperties;
  innerRef?: React.ForwardedRef<HTMLDivElement>;
  elevation?: number;
}

type DraggableListItemProps = { value: string; active: boolean };

const PaperContainer = tw(Paper)`
p-8
`;
const StyledDiv = tw.div`
mt-12
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
mt-4 text-end
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
      draggableId={item.value}
      index={index}
      key={item.value}
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
            <TextContainer>{item.value}</TextContainer>
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
  possibleValues,
  activeValues,
  sx,
  innerRef,
  elevation,
}: DraggableListProps) => {
  const [values, setValues] = React.useState<DraggableListItemProps[]>(
    possibleValues.map((possibleValue) => {
      return {
        value: possibleValue,
        active: activeValues.includes(possibleValue),
      };
    })
  );
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
        <Typography variant="h5">Table Settings</Typography>
        <Droppable droppableId={title.replace(' ', '').toLowerCase()}>
          {(provided) => (
            <StyledDiv {...provided.droppableProps} ref={provided.innerRef}>
              {values.map((value, index) => (
                <DraggableListItem
                  item={value}
                  index={index}
                  key={value.value}
                />
              ))}
              {provided.placeholder}
            </StyledDiv>
          )}
        </Droppable>
        <SaveButtonWrapper>
          <ButtonSubmit
            onClick={() => console.log(values)}
            color="primary"
            text="Save"
          />
        </SaveButtonWrapper>
      </DragDropContext>
    </PaperContainer>
  );
};

DraggableList.defaultProps = {
  type: 'primary',
};
export default DraggableList;
