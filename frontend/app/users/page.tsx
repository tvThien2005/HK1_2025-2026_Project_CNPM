// frontend/app/users/page.tsx
"use client";
import Head from "next/head";
// import Layout from "../../components/Layout";
import { Container, Table, Button } from "react-bootstrap";

const UsersPage = () => {
  return (
    <>
      <Head>
        <title>Quản lý tài khoản | Admin Bus Tracking</title>
      </Head>
      <Container fluid>
        <h1 className="my-4">Quản lý tài khoản</h1>
        <div className="d-flex justify-content-end mb-3">
          <Button variant="primary">Thêm tài khoản mới</Button>
        </div>
        <Table striped bordered hover className="shadow-sm">
          <thead>
            <tr>
              <th>Tên</th>
              <th>Vai trò</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Nguyễn Văn A</td>
              <td>Tài xế</td>
              <td>
                <Button variant="warning" size="sm" className="me-2">
                  Sửa
                </Button>
                <Button variant="danger" size="sm">
                  Xóa
                </Button>
              </td>
            </tr>
            <tr>
              <td>Trần Thị B</td>
              <td>Phụ huynh</td>
              <td>
                <Button variant="warning" size="sm" className="me-2">
                  Sửa
                </Button>
                <Button variant="danger" size="sm">
                  Xóa
                </Button>
              </td>
            </tr>
          </tbody>
        </Table>
      </Container>
    </>
  );
};

export default UsersPage;
