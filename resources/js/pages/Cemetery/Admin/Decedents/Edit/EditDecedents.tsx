import { DecedentDocumentTypeValue, DecedentProfile, IdentityStatusValue, SelectOption, VitalRecordTypeValue } from '@/Core/Types/Cemetery/cemetery';
import { MunicipalityType } from '@/Core/Types/Municipality/MunicipalityTypes';
import DecedentForm from '../Components/DecedentForm';

interface Props {
    municipality: MunicipalityType;
    decedent: { data: DecedentProfile };
    vital_record_options: SelectOption<VitalRecordTypeValue>[];
    identity_status_options: SelectOption<IdentityStatusValue>[];
    document_type_options: (SelectOption<DecedentDocumentTypeValue> & { restricted: boolean })[];
}

export default function EditDecedents(props: Props) {
    return <DecedentForm municipality={props.municipality} mode="edit" record={props.decedent.data} vitalRecordOptions={props.vital_record_options} identityStatusOptions={props.identity_status_options} documentTypeOptions={props.document_type_options} />;
}
