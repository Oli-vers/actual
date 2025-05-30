// @ts-strict-ignore
import React, { type ComponentProps } from 'react';

import { type CategoryEntity } from 'loot-core/types/models';

import {
  useDraggable,
  useDroppable,
  DropHighlight,
  type OnDragChangeCallback,
  type OnDropCallback,
} from '../sort';
import { Row } from '../table';

import { RenderMonths } from './RenderMonths';
import { SidebarCategory } from './SidebarCategory';

import { useDragRef } from '@desktop-client/hooks/useDragRef';

type IncomeCategoryProps = {
  cat: CategoryEntity;
  isLast?: boolean;
  editingCell: { id: CategoryEntity['id']; cell: string } | null;
  MonthComponent: ComponentProps<typeof RenderMonths>['component'];
  onEditName: ComponentProps<typeof SidebarCategory>['onEditName'];
  onEditMonth?: (id: CategoryEntity['id'], month: string) => void;
  onSave: ComponentProps<typeof SidebarCategory>['onSave'];
  onDelete: ComponentProps<typeof SidebarCategory>['onDelete'];
  onDragChange: OnDragChangeCallback<CategoryEntity>;
  onBudgetAction: (month: string, action: string, arg: unknown) => void;
  onReorder: OnDropCallback;
  onShowActivity: (id: CategoryEntity['id'], month: string) => void;
};

export function IncomeCategory({
  cat,
  isLast,
  editingCell,
  MonthComponent,
  onEditName,
  onEditMonth,
  onSave,
  onDelete,
  onDragChange,
  onBudgetAction,
  onReorder,
  onShowActivity,
}: IncomeCategoryProps) {
  const { dragRef } = useDraggable({
    type: 'income-category',
    onDragChange,
    item: cat,
    canDrag: editingCell === null,
  });
  const handleDragRef = useDragRef(dragRef);

  const { dropRef, dropPos } = useDroppable({
    types: 'income-category',
    id: cat.id,
    onDrop: onReorder,
  });

  return (
    <Row
      innerRef={dropRef}
      collapsed={true}
      style={{
        opacity: cat.hidden ? 0.5 : undefined,
      }}
    >
      <DropHighlight pos={dropPos} offset={{ top: 1 }} />

      <SidebarCategory
        innerRef={handleDragRef}
        category={cat}
        isLast={isLast}
        editing={
          editingCell &&
          editingCell.cell === 'name' &&
          editingCell.id === cat.id
        }
        onEditName={onEditName}
        onSave={onSave}
        onDelete={onDelete}
      />
      <RenderMonths
        component={MonthComponent}
        editingMonth={
          editingCell && editingCell.id === cat.id && editingCell.cell
        }
        args={{
          category: cat,
          onEdit: onEditMonth,
          isLast,
          onShowActivity,
          onBudgetAction,
        }}
      />
    </Row>
  );
}
