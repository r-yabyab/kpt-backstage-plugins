/**
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Table, TableColumn } from '@backstage/core-components';
import { useRouteRef } from '@backstage/core-plugin-api';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { packageRouteRef } from '../../../routes';
import { PackageRevision, PackageRevisionLifecycle } from '../../../types/PackageRevision';
import { Repository } from '../../../types/Repository';
import { formatCreationTimestamp } from '../../../utils/formatDate';
import { getPackageRevisionRevision } from '../../../utils/packageRevision';
import {
  diffPackageResources,
  getPackageResourcesFromResourcesMap,
  ResourceDiffStatus,
} from '../../../utils/packageRevisionResources';
import { RevisionSummary } from '../../../utils/revisionSummary';
import { IconButton, PackageIcon } from '../../Controls';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';

type PackageRevisionsTableProps = {
  repository: Repository;
  currentRevision: PackageRevision;
  revisions: RevisionSummary[];
};

type PackageRevisionRow = {
  id: string;
  name: string;
  revision: string;
  packageName: string;
  lifecycle: PackageRevisionLifecycle;
  resourcesCount: number;
  changesSummary: string;
  created: string;
  isCurrentRevision: boolean;
};

const renderStatusColumn = (row: PackageRevisionRow): JSX.Element => {
  const isUnpublishedRevision = row.lifecycle !== PackageRevisionLifecycle.PUBLISHED;

  return (
    <div style={{ position: 'absolute', transform: 'translateY(-50%)' }}>
      {row.isCurrentRevision && (
        <IconButton title="Revision being viewed">
          <ArrowForwardIcon />
        </IconButton>
      )}
      {isUnpublishedRevision && (
        <IconButton title={`${row.lifecycle} revision`}>
          <PackageIcon lifecycle={row.lifecycle} />
        </IconButton>
      )}
    </div>
  );
};

const getTableColumns = (): TableColumn<PackageRevisionRow>[] => {
  const renderStatus = (row: PackageRevisionRow): JSX.Element => renderStatusColumn(row);

  const columns: TableColumn<PackageRevisionRow>[] = [
    {
      title: 'Status',
      width: '80px',
      render: renderStatus,
    },
    { title: 'Revision', field: 'revision' },
    { title: 'Lifecycle', field: 'lifecycle' },
    { title: 'Resources', field: 'resourcesCount' },
    { title: 'Changes Summary', field: 'changesSummary' },
    { title: 'Created', field: 'created' },
  ];

  return columns;
};

const getResourcesChangesSummary = (summary: RevisionSummary, prevSummary?: RevisionSummary): string => {
  const getResourcesChangeText = (count: number, change: string): string => {
    return `${count} ${change}`;
  };

  if (!prevSummary) {
    return `Base revision`;
  }

  const resourcesDiff = diffPackageResources(
    getPackageResourcesFromResourcesMap(prevSummary.resourcesMap),
    getPackageResourcesFromResourcesMap(summary.resourcesMap),
  );
  const findResourceCount = (status: ResourceDiffStatus): number => {
    return resourcesDiff.filter(diff => diff.diffStatus === status).length;
  };

  const allChanges: string[] = [];
  const added = findResourceCount(ResourceDiffStatus.ADDED);
  const updated = findResourceCount(ResourceDiffStatus.UPDATED);
  const removed = findResourceCount(ResourceDiffStatus.REMOVED);

  if (added > 0) {
    allChanges.push(getResourcesChangeText(added, 'Added'));
  }
  if (updated > 0) {
    allChanges.push(getResourcesChangeText(updated, 'Updated'));
  }
  if (removed > 0) {
    allChanges.push(getResourcesChangeText(removed, 'Removed'));
  }

  const changeSummary = allChanges.length > 0 ? allChanges.join(', ') : 'no changes';

  return changeSummary;
};

const mapPackageRevisionsToRows = (
  revisions: RevisionSummary[],
  currentRevision: PackageRevision,
): PackageRevisionRow[] => {
  const mapToPackageRevisionRow = (
    summary: RevisionSummary,
    index: number,
    allSummaries: RevisionSummary[],
  ): PackageRevisionRow => {
    const { revision, resourcesMap } = summary;
    const previousSummary = allSummaries[index + 1];
    const creationTimestamp = formatCreationTimestamp(revision.metadata.creationTimestamp, true);

    return {
      id: revision.metadata.name,
      name: revision.metadata.name,
      packageName: revision.spec.packageName,
      revision: getPackageRevisionRevision(revision),
      lifecycle: revision.spec.lifecycle,
      created: creationTimestamp,
      resourcesCount: getPackageResourcesFromResourcesMap(resourcesMap).length,
      changesSummary: getResourcesChangesSummary(summary, previousSummary),
      isCurrentRevision: revision.metadata.name === currentRevision.metadata.name,
    };
  };

  return revisions.map(mapToPackageRevisionRow);
};

export const PackageRevisionsTable = ({ repository, revisions, currentRevision }: PackageRevisionsTableProps) => {
  const navigate = useNavigate();

  const packageRef = useRouteRef(packageRouteRef);

  const navigateToPackageRevision = (packageName?: string): void => {
    if (packageName) {
      const repositoryName = repository.metadata.name;

      navigate(packageRef({ repositoryName, packageName }));
    }
  };

  const columns = getTableColumns();
  const data = mapPackageRevisionsToRows(revisions, currentRevision);

  return (
    <Table
      title="Revisions"
      options={{ search: false, paging: false }}
      columns={columns}
      data={data}
      onRowClick={(_, thisPackage) => navigateToPackageRevision(thisPackage?.name)}
    />
  );
};
