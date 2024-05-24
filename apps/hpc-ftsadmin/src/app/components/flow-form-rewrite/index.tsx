import { Form, Formik } from 'formik';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

export const FlowRewriteForm = () => {
  const initialValues = {
    inputValue: '', // Initial value for the input field
  };

  const handleSubmit = (values: any) => {
    console.log('Form values:', values);
  };
  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit}>
      {(
        { values } // Destructure handleChange and values from Formik props
      ) => (
        <Form>
          <TextField
            name="inputValue"
            label="Input Field"
            variant="outlined"
            value={values.inputValue} // Set value prop to form values
          />

          <Button type="submit">submit</Button>
        </Form>
      )}
    </Formik>
  );
};
export default FlowRewriteForm;
