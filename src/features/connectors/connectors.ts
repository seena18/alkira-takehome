/**
 * Static seed data, deliberately shallow: name, where it is, what it spans,
 * and whether it is healthy. The rows seed component state and edits live and
 * die with the tab — consistent with the rest of the app, nothing pretends to
 * persist.
 */
export type ConnectorStatus = 'up' | 'degraded' | 'down'

export type Connector = {
  id: string
  name: string
  cloud: 'AWS' | 'Azure' | 'GCP'
  region: string
  cidr: string
  status: ConnectorStatus
}

export const SEED_CONNECTORS: Connector[] = [
  { id: 'c-1', name: 'aws-prod-vpc', cloud: 'AWS', region: 'us-west-2', cidr: '10.1.0.0/16', status: 'up' },
  { id: 'c-2', name: 'aws-dev-vpc', cloud: 'AWS', region: 'us-east-1', cidr: '10.2.0.0/16', status: 'up' },
  { id: 'c-3', name: 'azure-hub-vnet', cloud: 'Azure', region: 'westus2', cidr: '10.3.0.0/16', status: 'degraded' },
  { id: 'c-4', name: 'gcp-analytics-vpc', cloud: 'GCP', region: 'us-central1', cidr: '10.4.0.0/16', status: 'up' },
  { id: 'c-5', name: 'azure-dr-vnet', cloud: 'Azure', region: 'eastus2', cidr: '10.5.0.0/16', status: 'down' },
]
