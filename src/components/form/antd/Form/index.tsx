import React, {FC, useState, useEffect, createRef, useRef} from 'react'
import {IFormGeneratorColumnItem} from '../../../../types/rebuilder'
import {IFormAntdProps} from '../../../../types/form-antd'
import {Form} from 'antd'
import {Row, Col} from 'reactstrap'
import * as yup from 'yup'
import {buildYup} from 'json-schema-to-yup'
import formItems from '../../../../assets/data/forms/antd/form-items'

const FormAntd: FC<IFormAntdProps> = ({data}) => {
    const lastItemRefIndex = useRef<number>(1)
    const yupSchema = buildYup(data.validationScheme)

    const yupSync: any = {
        async validator({field}: { field: any }, value: any) {
            await yupSchema.validateSyncAt(field, {[field]: value})
        }
    }

    const onFinish = (values: any) => {
        console.log('Success:', values)
    }

    const onFinishFailed = (errorInfo: any) => {
        console.log('Failed:', errorInfo)
    }

    const getInitialValues = () => {
        const values: any = {}

        data.columns.forEach((column) => {
            column.items.forEach((item) => {
                values[item.name] = item.initialValue
            })
        })

        return values
    }

    const FormItemComponent: FC<any> = (props) => {
        const formItemComponents = formItems(data.uiKit || 'antd')
        const formItemComponent = [...formItemComponents].find((formItem: any) => formItem.id === props.item.component)?.render({...props, ...props.item.props, ...props.item})

        return <>{formItemComponent}</>
    }

    const inputRefs: any = Array.from({length: 999}, () => createRef())

    const onInputKeyDown = (e: any, index: number) => {
        if (e.keyCode !== 13) return

        e.preventDefault()

        const refFocusResult = inputRefs[index + 1]?.current?.focus()
    }

    const getIndexedData = () => {
        const dataStored = {...data}

        dataStored.columns.forEach((column) => {
            column.items.forEach((item) => {
                item.index = lastItemRefIndex.current
                lastItemRefIndex.current++
            })
        })

        return dataStored
    }

    return (
        <main className="form-wrapper">
            <Form
                name="basic"
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                initialValues={getInitialValues()}
                autoComplete={data.autoComplete || 'off'}
                layout="vertical"
            >
                <Row>
                    {getIndexedData().columns.map((column, index) => (
                        <Col xs={column.colXs} sm={column.colSm} md={column.colMd} lg={column.colLg} xl={column.colXl}
                             key={`auto_generated_form_col_${index}`}>
                            <aside className="form-col-inner-wrapper">
                                {column.items.map((item: IFormGeneratorColumnItem, indexItem: number) => (
                                    <Form.Item
                                        label={item.label}
                                        name={item.name}
                                        rules={[yupSync]}
                                        key={`auto_generated_form_item_${indexItem}`}
                                    >
                                        <FormItemComponent
                                            onInputKeyDownFn={(e: any) => onInputKeyDown(e, item.index)}
                                            innerRef={inputRefs[item.index]}
                                            item={item}
                                        />
                                    </Form.Item>
                                ))}
                            </aside>
                        </Col>
                    ))}
                </Row>
            </Form>
        </main>
    )
}

export default FormAntd