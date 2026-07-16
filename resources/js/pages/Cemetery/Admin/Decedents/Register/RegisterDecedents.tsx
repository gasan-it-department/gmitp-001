import { IdentityStatusValue, SelectOption, VitalRecordTypeValue } from '@/Core/Types/Cemetery/cemetery';
import { MunicipalityType } from '@/Core/Types/Municipality/MunicipalityTypes';
import DecedentForm from '../Components/DecedentForm';

interface Props {
    municipality: MunicipalityType;
    vital_record_options: SelectOption<VitalRecordTypeValue>[];
    identity_status_options: SelectOption<IdentityStatusValue>[];
}

export default function RegisterDecedents(props: Props) {
    return <DecedentForm municipality={props.municipality} mode="create" vitalRecordOptions={props.vital_record_options} identityStatusOptions={props.identity_status_options} />;
}
