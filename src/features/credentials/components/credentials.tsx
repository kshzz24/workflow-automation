"use client";
import {
  EmptyView,
  EntityContainer,
  EntityHeader,
  EntityItem,
  EntityList,
  EntityPagination,
  EntitySearch,
  ErrorView,
  LoadingView,
} from "@/components/entity-components";
import {
  //   useCreateCredential,
  useRemoveCredential,
  useSuspenseCredentials,
} from "../hooks/use-credentials";
import React from "react";
import { useCredentialsParams } from "../hooks/use-credentials-params";
import { useEntitySearch } from "@/hooks/use-entity-search";
import { formatDistanceToNow } from "date-fns";
import { Credential, CredentialType } from "@/generated/prisma";
import { useRouter } from "next/navigation";
import Image from "next/image";

export const CredentialsList = () => {
  const credentials = useSuspenseCredentials();

  return (
    <EntityList
      items={credentials?.data?.items}
      getKey={(credential) => credential.id}
      renderItem={(credential) => <CredentialItem data={credential} />}
      emptyView={<CredentialsEmpty />}
    />
  );
};

export const CredentialsSearch = () => {
  const [params, setParams] = useCredentialsParams();
  const { searchValue, onSearchChange } = useEntitySearch({
    params,
    setParams,
  });

  return (
    <EntitySearch
      value={searchValue}
      onChange={onSearchChange}
      placeholder="Search credentials"
    />
  );
};

export const CredentialsHeader = ({ disabled }: { disabled?: boolean }) => {
  //   const createCredential = useCreateCredential();

  return (
    <EntityHeader
      title="Credentials"
      description="Create and manage your credentials"
      newButtonHref={"/credentials/new"}
      newButtonLabel="New Credential"
      disabled={disabled}
      // isCreating={createCredential.isPending}
      //    newButtonHref=""
    />
  );
};

export const CredentialsPagination = () => {
  const credentials = useSuspenseCredentials();
  const [params, setParams] = useCredentialsParams();
  return (
    <EntityPagination
      disabled={credentials.isFetching}
      totalPages={credentials.data.totalPages}
      page={credentials.data.page}
      onPageChange={(page) => setParams({ ...params, page })}
    />
  );
};

export const CredentialsContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <EntityContainer
      header={<CredentialsHeader />}
      search={<CredentialsSearch />}
      pagination={<CredentialsPagination />}
    >
      {children}
    </EntityContainer>
  );
};

export const CredentialsLoading = () => {
  return <LoadingView entity="Credentials" />;
};

export const CredentialsError = () => {
  return <ErrorView entity="Credentials" />;
};

export const CredentialsEmpty = () => {
  const router = useRouter();

  //   const createCredential = useCreateCredential();
  //   const { handleError, modal } = useUpgradeModal();

  const handleCreate = () => {
    router.push("/credentials/new");
  };

  return (
    <EmptyView
      onNew={handleCreate}
      message="You haven't created any credential yet"
    />
  );
};

const credentialsLogos: Record<CredentialType, string> = {
  [CredentialType.OPENAI]: "/openai.svg",
  [CredentialType.GEMINI]: "/gemini.svg",
  [CredentialType.ANTHROPIC]: "/anthropic.svg",
};

export const CredentialItem = ({ data }: { data: Credential }) => {
  const removeCredential = useRemoveCredential();
  const handleRemove = () => {
    removeCredential.mutate({ id: data.id });
  };

  const logo = credentialsLogos[data.type] || "/openai.svg";

  return (
    <EntityItem
      href={`/credentials/${data.id}`}
      title={data.name}
      subtitle={
        <>
          Update {formatDistanceToNow(data.updatedAt, { addSuffix: true })}{" "}
          &bull; Created{" "}
          {formatDistanceToNow(data.createdAt, { addSuffix: true })}
        </>
      }
      image={
        <div className="size-8 flex items-center justify-center">
          <Image src={logo} alt={data.type} width={20} height={20} />
        </div>
      }
      onRemove={handleRemove}
      isRemoving={removeCredential.isPending}
    />
  );
};
