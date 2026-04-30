import numpy as np
import onnx
from onnx import helper, TensorProto, numpy_helper

input_tensor = helper.make_tensor_value_info('input', TensorProto.FLOAT, [1, 64, 156])
output_tensor = helper.make_tensor_value_info('output', TensorProto.FLOAT, [1, 64, 601])

weight_data = np.random.randn(156, 601).astype(np.float32) * 0.01
bias_data = np.zeros(601, dtype=np.float32)

weight_init = numpy_helper.from_array(weight_data, name='weight')
bias_init = numpy_helper.from_array(bias_data, name='bias')

reshape_input = helper.make_tensor_value_info('reshape_in', TensorProto.FLOAT, None)
reshape_output = helper.make_tensor_value_info('reshape_out', TensorProto.FLOAT, None)

shape_2d = numpy_helper.from_array(np.array([64, 156], dtype=np.int64), name='shape_2d')
shape_3d = numpy_helper.from_array(np.array([1, 64, 601], dtype=np.int64), name='shape_3d')

reshape_node = helper.make_node('Reshape', inputs=['input', 'shape_2d'], outputs=['flat'], name='reshape_flat')
matmul_node = helper.make_node('MatMul', inputs=['flat', 'weight'], outputs=['mm_out'], name='matmul')
add_node = helper.make_node('Add', inputs=['mm_out', 'bias'], outputs=['add_out'], name='add_bias')
reshape_back = helper.make_node('Reshape', inputs=['add_out', 'shape_3d'], outputs=['output'], name='reshape_back')

graph = helper.make_graph(
    [reshape_node, matmul_node, add_node, reshape_back],
    'signgloss_stub',
    [input_tensor],
    [output_tensor],
    initializer=[weight_init, bias_init, shape_2d, shape_3d]
)

model = helper.make_model(graph, opset_imports=[helper.make_opsetid('', 17)])
model.ir_version = 8

onnx.checker.check_model(model)
onnx.save(model, 'models/signgloss_stub.onnx')
print('stub model saved to models/signgloss_stub.onnx')
print(f'input: [1, 64, 156] -> output: [1, 64, 601]')
