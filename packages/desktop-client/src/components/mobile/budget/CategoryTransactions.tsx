import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { TextOneLine } from '@actual-app/components/text-one-line';
import { View } from '@actual-app/components/view';

import { SchedulesProvider } from 'loot-core/client/data-hooks/schedules';
import {
  useTransactions,
  useTransactionsSearch,
} from 'loot-core/client/data-hooks/transactions';
import * as queries from 'loot-core/client/queries';
import { listen } from 'loot-core/platform/client/fetch';
import * as monthUtils from 'loot-core/shared/months';
import { q } from 'loot-core/shared/query';
import { isPreviewId } from 'loot-core/shared/transactions';
import {
  type CategoryEntity,
  type TransactionEntity,
} from 'loot-core/types/models';

import { useDispatch } from '../../../redux';
import { MobilePageHeader, Page } from '../../Page';
import { MobileBackButton } from '../MobileBackButton';
import { AddTransactionButton } from '../transactions/AddTransactionButton';
import { TransactionListWithBalances } from '../transactions/TransactionListWithBalances';

import { useCategoryPreviewTransactions } from '@desktop-client/hooks/useCategoryPreviewTransactions';
import { useDateFormat } from '@desktop-client/hooks/useDateFormat';
import { useLocale } from '@desktop-client/hooks/useLocale';
import { useNavigate } from '@desktop-client/hooks/useNavigate';

type CategoryTransactionsProps = {
  category: CategoryEntity;
  month: string;
};

export function CategoryTransactions({
  category,
  month,
}: CategoryTransactionsProps) {
  const locale = useLocale();

  const schedulesQuery = useMemo(() => q('schedules').select('*'), []);

  return (
    <Page
      header={
        <MobilePageHeader
          title={
            <View>
              <TextOneLine>{category.name}</TextOneLine>
              <TextOneLine>
                ({monthUtils.format(month, 'MMMM ‘yy', locale)})
              </TextOneLine>
            </View>
          }
          leftContent={<MobileBackButton />}
          rightContent={<AddTransactionButton categoryId={category.id} />}
        />
      }
      padding={0}
    >
      <SchedulesProvider query={schedulesQuery}>
        <TransactionListWithPreviews category={category} month={month} />
      </SchedulesProvider>
    </Page>
  );
}

type TransactionListWithPreviewsProps = {
  category: CategoryEntity;
  month: string;
};

function TransactionListWithPreviews({
  category,
  month,
}: TransactionListWithPreviewsProps) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const baseTransactionsQuery = useCallback(
    () =>
      q('transactions')
        .options({ splits: 'inline' })
        .filter(getCategoryMonthFilter(category, month))
        .select('*'),
    [category, month],
  );

  const [transactionsQuery, setTransactionsQuery] = useState(
    baseTransactionsQuery(),
  );
  const {
    transactions,
    isLoading,
    isLoadingMore,
    loadMore: loadMoreTransactions,
    reload: reloadTransactions,
  } = useTransactions({
    query: transactionsQuery,
  });

  const dateFormat = useDateFormat() || 'MM/dd/yyyy';

  useEffect(() => {
    return listen('sync-event', event => {
      if (event.type === 'applied') {
        const tables = event.tables;
        if (
          tables.includes('transactions') ||
          tables.includes('category_mapping') ||
          tables.includes('payee_mapping')
        ) {
          reloadTransactions();
        }
      }
    });
  }, [dispatch, reloadTransactions]);

  const { isSearching, search: onSearch } = useTransactionsSearch({
    updateQuery: setTransactionsQuery,
    resetQuery: () => setTransactionsQuery(baseTransactionsQuery()),
    dateFormat,
  });

  const onOpenTransaction = useCallback(
    (transaction: TransactionEntity) => {
      // details of how the native app used to handle preview transactions here can be found at commit 05e58279
      if (!isPreviewId(transaction.id)) {
        navigate(`/transactions/${transaction.id}`);
      }
    },
    [navigate],
  );

  const balance = queries.categoryBalance(category, month);
  const balanceCleared = queries.categoryBalanceCleared(category, month);
  const balanceUncleared = queries.categoryBalanceUncleared(category, month);

  const { previewTransactions } = useCategoryPreviewTransactions({
    categoryId: category.id,
    month,
  });

  const transactionsToDisplay = !isSearching
    ? // Do not render child transactions in the list, unless searching
      previewTransactions.concat(transactions.filter(t => !t.is_child))
    : transactions;

  return (
    <TransactionListWithBalances
      isLoading={isLoading}
      transactions={transactionsToDisplay}
      balance={balance}
      balanceCleared={balanceCleared}
      balanceUncleared={balanceUncleared}
      searchPlaceholder={`Search ${category.name}`}
      onSearch={onSearch}
      isLoadingMore={isLoadingMore}
      onLoadMore={loadMoreTransactions}
      onOpenTransaction={onOpenTransaction}
      onRefresh={undefined}
      account={undefined}
    />
  );
}

function getCategoryMonthFilter(category: CategoryEntity, month: string) {
  return {
    category: category.id,
    date: { $transform: '$month', $eq: month },
  };
}
